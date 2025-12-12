#!/bin/bash

# Vegas Casino Health Monitor Script
# Monitors the server and performs automatic recovery if needed

SERVER_URL="http://localhost:8080"
HEALTH_ENDPOINT="$SERVER_URL/health"
LOG_FILE="/home/ec2-user/vegas-casino/health-monitor.log"
SERVER_SCRIPT="/home/ec2-user/vegas-casino/server.js"
MAX_RESTART_ATTEMPTS=3
RESTART_COUNT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_server_process() {
    local pid=$(pgrep -f "node.*server.js")
    if [ -n "$pid" ]; then
        echo "$pid"
        return 0
    else
        return 1
    fi
}

check_health_endpoint() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" --max-time 10)
    if [ "$response" = "200" ]; then
        return 0
    else
        return 1
    fi
}

restart_server() {
    log "${RED}🔄 Attempting to restart Vegas Casino server...${NC}"
    
    # Kill existing process
    pkill -f "node.*server.js" 2>/dev/null
    sleep 5
    
    # Start new process
    cd /home/ec2-user/vegas-casino
    nohup node server.js > server.log 2>&1 &
    
    # Wait for startup
    sleep 10
    
    if check_server_process > /dev/null; then
        log "${GREEN}✅ Server restarted successfully${NC}"
        RESTART_COUNT=0
        return 0
    else
        log "${RED}❌ Server restart failed${NC}"
        RESTART_COUNT=$((RESTART_COUNT + 1))
        return 1
    fi
}

perform_health_check() {
    log "${YELLOW}🔍 Performing health check...${NC}"
    
    # Check if process is running
    local pid=$(check_server_process)
    if [ $? -ne 0 ]; then
        log "${RED}💥 Server process not running${NC}"
        return 1
    fi
    
    log "${GREEN}📊 Server process running (PID: $pid)${NC}"
    
    # Check health endpoint
    if check_health_endpoint; then
        log "${GREEN}💚 Health endpoint responding (HTTP 200)${NC}"
        
        # Get detailed health info
        local health_json=$(curl -s "$HEALTH_ENDPOINT" --max-time 5)
        local uptime=$(echo "$health_json" | grep -o '"uptime":[0-9]*' | cut -d':' -f2)
        local status=$(echo "$health_json" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$uptime" ]; then
            local hours=$((uptime / 3600))
            local minutes=$(((uptime % 3600) / 60))
            log "${GREEN}⏰ Uptime: ${hours}h ${minutes}m - Status: $status${NC}"
        fi
        
        return 0
    else
        log "${RED}💔 Health endpoint not responding${NC}"
        return 1
    fi
}

# Main monitoring loop
main() {
    log "${GREEN}🚀 Vegas Casino Health Monitor Started${NC}"
    log "Health endpoint: $HEALTH_ENDPOINT"
    log "Max restart attempts: $MAX_RESTART_ATTEMPTS"
    
    while true; do
        if perform_health_check; then
            # Server is healthy
            log "${GREEN}✅ Server is healthy${NC}"
        else
            # Server is unhealthy
            log "${RED}🚨 Server health check failed${NC}"
            
            if [ $RESTART_COUNT -lt $MAX_RESTART_ATTEMPTS ]; then
                restart_server
            else
                log "${RED}💥 Maximum restart attempts reached ($MAX_RESTART_ATTEMPTS). Manual intervention required.${NC}"
                log "${RED}🆘 Sending alert notification...${NC}"
                
                # You could add email/Slack notifications here
                # Example: curl -X POST "https://hooks.slack.com/..." -d "{'text':'Vegas Casino server down!'}"
                
                # Wait longer before trying again
                log "${YELLOW}⏰ Waiting 5 minutes before next attempt...${NC}"
                sleep 300
                RESTART_COUNT=0  # Reset after waiting
            fi
        fi
        
        # Wait before next check (60 seconds)
        sleep 60
    done
}

# Handle signals
trap 'log "🛑 Health monitor stopping..."; exit 0' SIGTERM SIGINT

# Start monitoring
main