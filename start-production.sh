#!/bin/bash

# Vegas Casino Production Startup Script
# Starts the server with monitoring and self-healing capabilities

CASINO_DIR="/home/ec2-user/vegas-casino"
SERVER_LOG="$CASINO_DIR/server.log"
MONITOR_LOG="$CASINO_DIR/health-monitor.log"
ERROR_LOG="$CASINO_DIR/error.log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

cleanup_logs() {
    log "${YELLOW}🧹 Cleaning up old logs...${NC}"
    
    # Clean up logs older than 1 day (since they're in Dynatrace)
    log "🗑️ Removing logs older than 1 day (data preserved in Dynatrace)..."
    
    # Remove old log files in main directory
    find "$CASINO_DIR" -name "*.log" -type f -mtime +1 -delete 2>/dev/null || true
    find "$CASINO_DIR" -name "*.log.old" -type f -delete 2>/dev/null || true
    
    # Remove old cheat detection logs
    if [ -d "$CASINO_DIR/vegas-cheat-logs" ]; then
        find "$CASINO_DIR/vegas-cheat-logs" -name "*.log" -type f -mtime +1 -delete 2>/dev/null || true
        log "🎯 Cleaned up old cheat detection logs"
    fi
    
    # Remove old service logs if they exist
    if [ -d "$CASINO_DIR/logs" ]; then
        find "$CASINO_DIR/logs" -name "*.log" -type f -mtime +1 -delete 2>/dev/null || true
        log "⚙️ Cleaned up old service logs"
    fi
    
    # Rotate current logs if they're too large (>100MB)
    for logfile in "$SERVER_LOG" "$MONITOR_LOG" "$ERROR_LOG"; do
        if [ -f "$logfile" ] && [ $(stat -f%z "$logfile" 2>/dev/null || stat -c%s "$logfile" 2>/dev/null) -gt 104857600 ]; then
            mv "$logfile" "${logfile}.old"
            touch "$logfile"
            log "📋 Rotated large log file: $(basename $logfile)"
        fi
    done
    
    # Clear temporary files
    rm -f "$CASINO_DIR"/nohup.out 2>/dev/null || true
    rm -f /tmp/vegas-casino-* 2>/dev/null || true
    
    log "${GREEN}✨ Log cleanup completed - disk usage optimized${NC}"
}

check_dependencies() {
    log "${YELLOW}🔍 Checking dependencies...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log "${RED}❌ Node.js not found${NC}"
        exit 1
    fi
    
    # Check npm packages
    cd "$CASINO_DIR"
    if [ ! -d "node_modules" ]; then
        log "${YELLOW}📦 Installing npm packages...${NC}"
        npm install
    fi
    
    log "${GREEN}✅ Dependencies OK${NC}"
}

start_server() {
    log "${YELLOW}🚀 Starting Vegas Casino server...${NC}"
    
    cd "$CASINO_DIR"
    
    # Start server with comprehensive logging
    nohup node server.js > "$SERVER_LOG" 2>"$ERROR_LOG" &
    SERVER_PID=$!
    
    log "${GREEN}🎰 Server started with PID: $SERVER_PID${NC}"
    
    # Wait for server to initialize
    log "${YELLOW}⏰ Waiting for server initialization...${NC}"
    sleep 15
    
    # Check if server is responding
    local attempts=0
    while [ $attempts -lt 10 ]; do
        if curl -s http://localhost:8080/health > /dev/null; then
            log "${GREEN}✅ Server is responding on port 8080${NC}"
            return 0
        fi
        attempts=$((attempts + 1))
        sleep 2
    done
    
    log "${RED}❌ Server failed to start properly${NC}"
    return 1
}

start_monitoring() {
    log "${YELLOW}👀 Starting health monitoring...${NC}"
    
    # Make monitor script executable
    chmod +x "$CASINO_DIR/monitor-health.sh"
    
    # Start health monitor in background
    nohup "$CASINO_DIR/monitor-health.sh" > "$MONITOR_LOG" 2>&1 &
    MONITOR_PID=$!
    
    log "${GREEN}🏥 Health monitor started with PID: $MONITOR_PID${NC}"
}

display_status() {
    log "${GREEN}🎉 Vegas Casino Production Environment Started!${NC}"
    echo ""
    echo "📊 System Information:"
    echo "   Server URL: http://$(curl -s ifconfig.me):8080"
    echo "   Local URL: http://localhost:8080"
    echo "   Health Check: http://localhost:8080/health"
    echo "   Admin Panel: http://localhost:8080/admin"
    echo ""
    echo "📂 Log Files:"
    echo "   Server Log: $SERVER_LOG"
    echo "   Monitor Log: $MONITOR_LOG" 
    echo "   Error Log: $ERROR_LOG"
    echo ""
    echo "🔧 Management Commands:"
    echo "   View server logs: tail -f $SERVER_LOG"
    echo "   View monitor logs: tail -f $MONITOR_LOG"
    echo "   Check health: curl http://localhost:8080/health"
    echo "   Stop server: pkill -f 'node.*server.js'"
    echo "   Stop monitor: pkill -f monitor-health.sh"
    echo ""
    echo "⚡ Features Enabled:"
    echo "   ✅ Automated cheat detection and lockout"
    echo "   ✅ Real-time health monitoring"
    echo "   ✅ Self-healing and error recovery"
    echo "   ✅ Load balancing across 5 services"
    echo "   ✅ Dynatrace integration"
    echo "   ✅ 48+ hour uptime capability"
    echo ""
}

# Main startup sequence
main() {
    log "${GREEN}🎰 Vegas Casino Production Startup${NC}"
    log "Starting at: $(date)"
    
    # Change to casino directory
    cd "$CASINO_DIR" || exit 1
    
    # Cleanup and preparation
    cleanup_logs
    check_dependencies
    
    # Start services
    if start_server; then
        start_monitoring
        display_status
        
        log "${GREEN}🚀 Production environment ready for 48+ hour operation${NC}"
        log "Monitor the health at: http://localhost:8080/health"
    else
        log "${RED}💥 Startup failed${NC}"
        exit 1
    fi
}

# Handle interruption
trap 'log "🛑 Startup interrupted"; exit 1' SIGTERM SIGINT

# Run main function
main