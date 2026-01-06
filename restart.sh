#!/bin/bash

echo "🛑 Stopping Vegas Casino services..."

# Kill all processes on Vegas ports 8080-8084
sudo lsof -t -i:8080,8081,8082,8083,8084 | xargs -r sudo kill -9

# Wait a moment for processes to fully stop
sleep 2

# Verify processes are stopped
if ps aux | grep -E "(node server.js|vegas)" | grep -v grep > /dev/null; then
    echo "⚠️  Some processes still running, force killing..."
    ps aux | grep -E "(node server.js|vegas)" | grep -v grep | awk '{print $2}' | xargs -r kill -9
    sleep 1
fi

echo "✅ All Vegas processes stopped"

# Navigate to the correct directory
cd /home/ec2-user/vegas-casino

echo "🚀 Starting Vegas Casino app..."

# Start the app in background
nohup npm start > app.log 2>&1 &

# Wait for startup
sleep 3

# Check if services are running
echo "📊 Checking service status..."
if sudo netstat -tulpn | grep -E "(8080|8081|8082|8083|8084)" | grep LISTEN > /dev/null; then
    echo "✅ Vegas Casino services started successfully!"
    echo "🌐 Main server: http://3.85.230.103:8080"
    echo "🎰 Game services running on ports 8081-8084"
    echo "📋 Logs available in: app.log"
else
    echo "❌ Error: Services failed to start. Check app.log for details"
    exit 1
fi