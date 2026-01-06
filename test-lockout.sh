#!/bin/bash

# Test script for Vegas Casino Lockout API
# This demonstrates how to trigger a user lockout via the API

echo "🎯 Testing Vegas Casino Lockout API"
echo "================================="

# Get the current EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "🌐 EC2 Public IP: $EC2_IP"

# API Endpoint
API_URL="http://$EC2_IP:8080/api/admin/lockout-user-cheat"
echo "📡 API Endpoint: $API_URL"

# Test payload - simulating a cheat detection from Dynatrace DQL
TEST_PAYLOAD='[
  {
    "json.CustomerName": "DemoUser",
    "json.cheatType": "win_boost", 
    "json.winAmount": 750
  }
]'

echo ""
echo "📋 Test Payload:"
echo "$TEST_PAYLOAD" | jq .

echo ""
echo "🚀 Sending lockout request..."

# Send the lockout request
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD")

echo ""
echo "📥 API Response:"
echo "$RESPONSE" | jq .

echo ""
echo "✅ Lockout test completed!"
echo ""
echo "💡 To trigger this from Dynatrace workflow:"
echo "   POST $API_URL"
echo "   Content-Type: application/json"
echo "   Body: Array of cheat records from DQL query"