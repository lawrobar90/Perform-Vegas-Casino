# Vegas Casino Production Management Guide

## 🎰 Server Overview

The Vegas Casino server is now equipped with production-grade resilience features designed for **48+ hour continuous operation** with comprehensive error handling, self-healing mechanisms, and health monitoring.

### Key Features
- ✅ **Automated Cheat Detection & Lockout** - Real-time detection with Dynatrace integration
- ✅ **Self-Healing Error Recovery** - Automatic recovery from memory leaks and errors  
- ✅ **Health Monitoring** - Continuous system monitoring with alerts
- ✅ **Load Balancing** - 5 game services (Blackjack, Poker, Roulette, Slots, Main)
- ✅ **Graceful Shutdown** - Clean process termination with resource cleanup
- ✅ **Intelligent Log Management** - Automatic cleanup of logs older than 1 day (preserved in Dynatrace)
- ✅ **Memory Management** - Garbage collection and memory optimization
- ✅ **Disk Space Optimization** - Minimal disk usage with hourly cleanup cycles

## 🚀 Quick Start Commands

### Start Production Environment
```bash
cd /home/ec2-user/vegas-casino
./start-production.sh
```

### Check System Status
```bash
./check-status.sh
```

### Stop All Services
```bash
pkill -f 'node.*server.js' && pkill -f 'monitor-health.sh'
```

## 📊 Monitoring & Health Checks

### Health Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /health` | Basic health check | Server status, uptime, memory |
| `GET /api/admin/system-metrics` | Detailed metrics | CPU, memory, sessions, errors |
| `POST /api/admin/self-heal` | Manual recovery | Trigger self-healing procedures |

### Health Check Commands
```bash
# Basic health check
curl http://localhost:8080/health | jq

# Detailed system metrics  
curl http://localhost:8080/api/admin/system-metrics | jq

# Trigger self-healing
curl -X POST http://localhost:8080/api/admin/self-heal | jq
```

### External Access
- **Public URL**: http://3.209.41.33:8080
- **Local URL**: http://localhost:8080
- **Admin Panel**: http://localhost:8080/admin

## 📂 Log Management

### Log Files
```
/home/ec2-user/vegas-casino/
├── server.log             # Main server activity (current day only)
├── health-monitor.log     # Health monitoring activity (current day only)  
├── error.log             # Error and exception logs (current day only)
├── vegas-cheat-logs/     # Cheat detection logs (auto-cleaned daily)
└── logs/                 # Service logs (auto-cleaned daily)
```

**Note**: All logs older than 1 day are automatically removed to minimize disk usage, as the data is preserved in Dynatrace for analysis.

### Viewing Logs
```bash
# Live server logs
tail -f /home/ec2-user/vegas-casino/server.log

# Live monitor logs
tail -f /home/ec2-user/vegas-casino/health-monitor.log

# Recent errors
tail -20 /home/ec2-user/vegas-casino/error.log

# Search for specific errors
grep -i "error\|failed\|exception" /home/ec2-user/vegas-casino/server.log
```

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Server Not Responding
```bash
# Check if server is running
ps aux | grep "node.*server.js"

# Check port availability
netstat -tulpn | grep :8080

# Restart server
pkill -f "node.*server.js"
cd /home/ec2-user/vegas-casino
./start-production.sh
```

#### High Memory Usage
```bash
# Check memory usage
curl http://localhost:8080/api/admin/system-metrics | jq .memory

# Force garbage collection
curl -X POST http://localhost:8080/api/admin/self-heal

# Monitor memory over time
watch -n 30 'curl -s http://localhost:8080/health | jq .memory'
```

#### Service Port Conflicts
```bash
# Kill all Node.js processes
pkill -f node

# Wait and restart
sleep 5
./start-production.sh
```

#### Log Files Too Large
```bash
# Check log sizes
du -h *.log

# Force cleanup of old logs (>1 day old)
curl -X POST http://localhost:8080/api/admin/self-heal

# Manual log rotation (if needed)
mv server.log server.log.old
mv error.log error.log.old
touch server.log error.log

# Note: Auto-cleanup runs every hour and removes logs older than 1 day
```

## ⚙️ Configuration

### Health Configuration (in server.js)
```javascript
const HEALTH_CONFIG = {
  errorThreshold: 100,        // Max errors per hour
  memoryThreshold: 1024 * 1024 * 1024, // 1GB memory limit
  isHealthy: true,
  errorCount: 0,
  lastError: null,
  startTime: Date.now()
};
```

### Environment Variables
- `NODE_ENV`: Set to 'production' for production mode
- `PORT`: Main server port (default: 8080)
- `LOG_LEVEL`: Logging verbosity (info, debug, error)

## 🛡️ Security & Best Practices

### Security Features
- Input validation on all endpoints
- CORS protection for cross-origin requests
- Rate limiting on sensitive endpoints
- Secure WebSocket connections
- Error sanitization (no stack traces in production)

### Best Practices
1. **Regular Health Checks**: Monitor `/health` endpoint every 60 seconds
2. **Log Monitoring**: Watch for error patterns in logs
3. **Memory Monitoring**: Alert if memory usage > 800MB
4. **Backup Strategy**: Regular backup of user data and configurations
5. **Update Strategy**: Test updates in staging before production

## 📈 Performance Optimization

### Load Testing
```bash
# Run load test with balance management
node scripts/comprehensive-load-test.js

# Monitor during load test
watch -n 10 './check-status.sh'
```

### Performance Metrics
- **Target Uptime**: 48+ hours continuous operation  
- **Response Time**: < 100ms for health checks
- **Memory Usage**: < 1GB sustained
- **Error Rate**: < 1% of total requests

## 🔄 Maintenance Schedule

### Daily
- Check health status: `./check-status.sh`
- Review error logs for patterns
- Monitor memory usage trends

### Weekly  
- Rotate large log files
- Review performance metrics
- Update dependencies if needed

### Monthly
- Full system backup
- Security audit
- Performance review

## 🚨 Alerting & Notifications

### Critical Alerts
- Server process not running
- Memory usage > 90% 
- Error rate > 10 errors/minute
- Health endpoint not responding

### Alert Commands
```bash
# Check if alerting is needed
health_status=$(curl -s http://localhost:8080/health | jq -r .status)
if [ "$health_status" != "healthy" ]; then
  echo "ALERT: Server unhealthy - $health_status"
fi
```

## 📞 Emergency Procedures

### Server Down Emergency
1. Check process: `ps aux | grep node`
2. Check logs: `tail -50 error.log`
3. Restart: `./start-production.sh`
4. Verify: `curl http://localhost:8080/health`

### Memory Emergency
1. Force self-heal: `curl -X POST http://localhost:8080/api/admin/self-heal`
2. Monitor: `watch -n 5 'curl -s http://localhost:8080/health | jq .memory'`
3. If critical: Restart server

### Disk Space Emergency
1. Check space: `df -h`
2. Clean logs: `echo "" > server.log && echo "" > error.log`
3. Clear temp files: `rm -f /tmp/node-*`

---

## 📋 Quick Reference

| Task | Command |
|------|---------|
| Start | `./start-production.sh` |
| Status | `./check-status.sh` |
| Health | `curl http://localhost:8080/health` |
| Stop | `pkill -f 'node.*server.js'` |
| Logs | `tail -f server.log` |
| Heal | `curl -X POST http://localhost:8080/api/admin/self-heal` |

**External Access**: http://3.209.41.33:8080  
**Documentation**: This file  
**Support**: Check logs and health endpoints

---
*Vegas Casino Production Server - Designed for 48+ hour uptime with comprehensive resilience*