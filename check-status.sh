#!/bin/bash

# Vegas Casino Status Check Script
# Provides comprehensive status information about the server and monitoring

SERVER_URL="http://localhost:8080"
CASINO_DIR="/home/ec2-user/vegas-casino"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to format bytes
format_bytes() {
    local bytes=$1
    if [ $bytes -gt 1073741824 ]; then
        echo "$(( bytes / 1073741824 ))GB"
    elif [ $bytes -gt 1048576 ]; then
        echo "$(( bytes / 1048576 ))MB"
    elif [ $bytes -gt 1024 ]; then
        echo "$(( bytes / 1024 ))KB"
    else
        echo "${bytes}B"
    fi
}

# Function to format seconds
format_time() {
    local seconds=$1
    local days=$(( seconds / 86400 ))
    local hours=$(( (seconds % 86400) / 3600 ))
    local minutes=$(( (seconds % 3600) / 60 ))
    
    if [ $days -gt 0 ]; then
        echo "${days}d ${hours}h ${minutes}m"
    elif [ $hours -gt 0 ]; then
        echo "${hours}h ${minutes}m"
    else
        echo "${minutes}m"
    fi
}

check_process_status() {
    echo -e "${BLUE}🔍 Process Status:${NC}"
    
    # Check server process
    local server_pid=$(pgrep -f "node.*server.js" | head -1)
    if [ -n "$server_pid" ]; then
        local server_mem=$(ps -o rss= -p $server_pid 2>/dev/null | tr -d ' ')
        local server_cpu=$(ps -o %cpu= -p $server_pid 2>/dev/null | tr -d ' ')
        local server_count=$(pgrep -f "node.*server.js" | wc -l)
        echo -e "   ${GREEN}✅ Server Process (${server_count} instances)${NC}"
        echo "      Main PID: $server_pid"
        if [ -n "$server_mem" ]; then
            echo "      Memory: $(format_bytes $((server_mem * 1024)))"
        fi
        if [ -n "$server_cpu" ]; then
            echo "      CPU: ${server_cpu}%"
        fi
    else
        echo -e "   ${RED}❌ Server Process: Not running${NC}"
    fi
    
    # Check monitor process
    local monitor_pid=$(pgrep -f "monitor-health.sh")
    if [ -n "$monitor_pid" ]; then
        echo -e "   ${GREEN}✅ Health Monitor${NC}"
        echo "      PID: $monitor_pid"
    else
        echo -e "   ${RED}❌ Health Monitor: Not running${NC}"
    fi
    echo ""
}

check_server_health() {
    echo -e "${BLUE}🏥 Server Health:${NC}"
    
    # Check if server responds
    local health_response=$(curl -s "$SERVER_URL/health" --max-time 5)
    if [ $? -eq 0 ]; then
        echo -e "   ${GREEN}✅ Health Endpoint: Responding${NC}"
        
        # Parse health data
        local status=$(echo "$health_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        local uptime=$(echo "$health_response" | grep -o '"uptime":[0-9]*' | cut -d':' -f2)
        local memory=$(echo "$health_response" | grep -o '"memoryUsage":[0-9]*' | cut -d':' -f2)
        local errors=$(echo "$health_response" | grep -o '"errorCount":[0-9]*' | cut -d':' -f2)
        
        echo "      Status: $status"
        if [ -n "$uptime" ]; then
            echo "      Uptime: $(format_time $uptime)"
        fi
        if [ -n "$memory" ]; then
            echo "      Memory: $(format_bytes $memory)"
        fi
        if [ -n "$errors" ]; then
            echo "      Errors: $errors"
        fi
    else
        echo -e "   ${RED}❌ Health Endpoint: Not responding${NC}"
    fi
    echo ""
}

check_services() {
    echo -e "${BLUE}🎰 Casino Services:${NC}"
    
    local services=(
        "8080:Main Casino"
        "8081:Blackjack" 
        "8082:Poker"
        "8083:Roulette"
        "8084:Slots"
    )
    
    for service in "${services[@]}"; do
        local port=$(echo $service | cut -d':' -f1)
        local name=$(echo $service | cut -d':' -f2)
        
        if curl -s "http://localhost:$port" --max-time 3 > /dev/null; then
            echo -e "   ${GREEN}✅ $name (Port $port)${NC}"
        else
            echo -e "   ${RED}❌ $name (Port $port)${NC}"
        fi
    done
    echo ""
}

check_logs() {
    echo -e "${BLUE}📋 Recent Log Activity:${NC}"
    
    local log_files=(
        "$CASINO_DIR/server.log:Server"
        "$CASINO_DIR/health-monitor.log:Monitor"
        "$CASINO_DIR/error.log:Errors"
    )
    
    for log_info in "${log_files[@]}"; do
        local log_file=$(echo $log_info | cut -d':' -f1)
        local log_name=$(echo $log_info | cut -d':' -f2)
        
        if [ -f "$log_file" ]; then
            local size=$(stat -c%s "$log_file" 2>/dev/null || stat -f%z "$log_file" 2>/dev/null)
            local lines=$(wc -l < "$log_file" 2>/dev/null || echo "0")
            echo "   📄 $log_name: $(format_bytes $size), $lines lines"
            
            # Show last error if error log
            if [[ "$log_file" == *"error.log"* ]] && [ -s "$log_file" ]; then
                local last_error=$(tail -1 "$log_file" 2>/dev/null)
                if [ -n "$last_error" ]; then
                    echo -e "      ${YELLOW}Last Error: ${last_error:0:80}...${NC}"
                fi
            fi
        else
            echo -e "   ${RED}❌ $log_name: File not found${NC}"
        fi
    done
    echo ""
}

check_system_resources() {
    echo -e "${BLUE}💻 System Resources:${NC}"
    
    # Memory usage
    local mem_info=$(free -h | grep "Mem:")
    local mem_used=$(echo $mem_info | awk '{print $3}')
    local mem_total=$(echo $mem_info | awk '{print $2}')
    echo "   Memory: $mem_used / $mem_total"
    
    # Disk usage for casino directory
    local disk_usage=$(df -h "$CASINO_DIR" | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')
    echo "   Disk: $disk_usage"
    
    # Load average
    local load_avg=$(uptime | awk -F'load average:' '{print $2}')
    echo "   Load:$load_avg"
    
    # System uptime
    local sys_uptime=$(uptime -p)
    echo "   System: $sys_uptime"
    echo ""
}

show_quick_commands() {
    echo -e "${BLUE}⚡ Quick Commands:${NC}"
    echo "   View live server logs: tail -f $CASINO_DIR/server.log"
    echo "   View live monitor logs: tail -f $CASINO_DIR/health-monitor.log"
    echo "   Check detailed health: curl http://localhost:8080/health | jq"
    echo "   Restart server: pkill -f 'node.*server.js' && cd $CASINO_DIR && node server.js"
    echo "   Stop all: pkill -f 'node.*server.js' && pkill -f 'monitor-health.sh'"
    echo "   Force self-heal: curl http://localhost:8080/api/admin/self-heal"
    echo ""
}

# Main status check
main() {
    echo -e "${GREEN}🎰 Vegas Casino Status Report${NC}"
    echo "Generated: $(date)"
    echo "=========================================="
    echo ""
    
    check_process_status
    check_server_health
    check_services
    check_logs
    check_system_resources
    show_quick_commands
    
    echo "=========================================="
    echo -e "${GREEN}Status check complete${NC}"
}

# Run main function
main