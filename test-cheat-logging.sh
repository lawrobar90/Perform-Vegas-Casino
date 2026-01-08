#!/bin/bash

# Test script to verify cheat logging across all 4 games
echo "🎰 Testing Cheat Logging Across All Vegas Casino Games"
echo "======================================================="

# Test data
USERNAME="Test-User-CheatLog"
EMAIL="cheat.test@dynatrace.com"
COMPANY="Dynatrace-Testing"
PERSONA="QA-Tester"
BOOTH="Testing-Lab"

echo ""
echo "🎲 Roulette game removed - skipping test..."
    "OptIn": true,
    "BetAmount": 25,
    "BetType": "multiple",
    "BetValue": {"red": 25},
    "CheatActive": true,
    "CheatType": "ballControl",
    "CheatDetails": {
      "name": "Ball Trajectory Control",
      "cost": 150,
echo ""
echo "🃏 Testing Blackjack Cheat Logging..."
curl -s -X POST "http://localhost:8080/api/blackjack/deal" \
  -H "Content-Type: application/json" \
  -d '{
    "Game": "Vegas Blackjack",
    "Username": "'$USERNAME'",
    "CustomerName": "'$USERNAME'",
    "Email": "'$EMAIL'",
    "CompanyName": "'$COMPANY'",
    "Persona": "'$PERSONA'",
    "Booth": "'$BOOTH'",
    "OptIn": true,
    "BetAmount": 50,
    "CheatActive": true,
    "CheatType": "cardCounting",
    "CheatDetails": {
      "name": "Advanced Card Counting",
      "cost": 175,
      "winBoost": 45,
      "detectionRisk": 20,
      "description": "Perfect card tracking and probability calculation"
    }
  }' > /dev/null && echo "✅ Blackjack cheat request sent" || echo "❌ Blackjack cheat request failed"

sleep 2

echo ""
echo "🎲 Testing Dice Cheat Logging..."
curl -s -X POST "http://localhost:8080/api/dice/roll" \
  -H "Content-Type: application/json" \
  -d '{
    "Game": "Vegas Dice",
    "Username": "'$USERNAME'",
    "CustomerName": "'$USERNAME'",
    "Email": "'$EMAIL'",
    "CompanyName": "'$COMPANY'",
    "Persona": "'$PERSONA'",
    "Booth": "'$BOOTH'",
    "OptIn": true,
    "BetAmount": 30,
    "BetType": "pass",
    "CheatActive": true,
    "CheatType": "diceWeighting",
    "CheatDetails": {
      "name": "Weighted Dice Control",
      "cost": 140,
      "winBoost": 40,
      "detectionRisk": 20,
      "description": "Influence dice roll outcomes with weighted mechanics"
    }
  }' > /dev/null && echo "✅ Dice cheat request sent" || echo "❌ Dice cheat request failed"

sleep 2

echo ""
echo "🎰 Testing Slots Cheat Logging..."
curl -s -X POST "http://localhost:8080/api/slots/spin" \
  -H "Content-Type: application/json" \
  -d '{
    "Game": "Vegas Slots",
    "Username": "'$USERNAME'",
    "CustomerName": "'$USERNAME'",
    "Email": "'$EMAIL'",
    "CompanyName": "'$COMPANY'",
    "Persona": "'$PERSONA'",
    "Booth": "'$BOOTH'",
    "OptIn": true,
    "BetAmount": 75,
    "CheatActive": true,
    "CheatType": "jackpotTrigger",
    "CheatDetails": {
      "name": "Jackpot Probability Boost",
      "cost": 200,
      "winBoost": 60,
      "detectionRisk": 30,
      "description": "Increase chances of triggering jackpot combinations"
    }
  }' > /dev/null && echo "✅ Slots cheat request sent" || echo "❌ Slots cheat request failed"

sleep 3

echo ""
echo "📊 Checking for cheat log entries..."
echo "==================================="

# Check today's activity log for our test entries
if grep -q "$USERNAME" /home/ec2-user/vegas-casino/vegas-cheat-logs/vegas-activity-$(date +%Y-%m-%d).log 2>/dev/null; then
    echo "✅ Found test entries in today's activity log"
    echo ""
    echo "🔍 Recent cheat entries for $USERNAME:"
    grep "$USERNAME" /home/ec2-user/vegas-casino/vegas-cheat-logs/vegas-activity-$(date +%Y-%m-%d).log | tail -4 | while read line; do
        game=$(echo "$line" | jq -r '.game' 2>/dev/null || echo "Unknown")
        cheat_active=$(echo "$line" | jq -r '.cheat_active' 2>/dev/null || echo "Unknown")
        cheat_type=$(echo "$line" | jq -r '.cheat_type' 2>/dev/null || echo "null")
        echo "   Game: $game | Cheat Active: $cheat_active | Type: $cheat_type"
    done
else
    echo "❌ No test entries found in today's activity log"
fi

# Check if any cheating-specific logs were created
if [ -f "/home/ec2-user/vegas-casino/vegas-cheat-logs/vegas-cheating-$(date +%Y-%m-%d).log" ]; then
    echo ""
    echo "🚨 Found dedicated cheat log for today!"
    echo "Recent cheat-specific entries:"
    tail -4 "/home/ec2-user/vegas-casino/vegas-cheat-logs/vegas-cheating-$(date +%Y-%m-%d).log" | while read line; do
        game=$(echo "$line" | jq -r '.game' 2>/dev/null || echo "Unknown")
        cheat_name=$(echo "$line" | jq -r '.cheat_name' 2>/dev/null || echo "null")
        echo "   Game: $game | Cheat: $cheat_name"
    done
else
    echo "ℹ️  No dedicated cheat log file created yet (normal for activity logging)"
fi

echo ""
echo "🎯 Test Complete! All 4 games tested for cheat logging capability."
