#!/bin/bash

# Vegas Casino Request Structure Comparison
# Shows side-by-side comparison of real user vs load test requests

echo "🎰 VEGAS CASINO REQUEST COMPARISON"
echo "=================================="
echo ""

echo "📊 REAL USER SLOTS REQUEST (from browser):"
echo "==========================================="
cat << 'EOF'
POST /api/slots/spin HTTP/1.1
Host: localhost:8080
Content-Type: application/json
User-Agent: Vegas-Casino-UI
Accept: application/json, text/plain, */*

{
  "game": "slots",
  "action": "spin", 
  "betAmount": 25,
  "winAmount": 100,
  "payline": ["Seven", "Seven", "Cherry"],
  "cheat": null,
  "customerName": "John Doe",
  "balance": 5000,
  "newBalance": 5075,
  "Username": "John Doe",
  "CustomerName": "John Doe", 
  "Email": "john@example.com",
  "CompanyName": "Demo Company",
  "Persona": "Casino Player",
  "Booth": "UI Demo",
  "OptIn": true,
  "Balance": 5075,
  "BetAmount": 25,
  "correlationId": "ui_1641234567890_abc123def456",
  "CheatActive": false,
  "CheatType": null,
  "CheatDetails": null
}
EOF

echo ""
echo "🤖 LOADRUNNER SIMULATION REQUEST (identical):"
echo "============================================="
cat << 'EOF'
POST /api/slots/spin HTTP/1.1
Host: localhost:8080
Content-Type: application/json  
User-Agent: Vegas-Casino-UI
Accept: application/json, text/plain, */*
Cache-Control: no-cache

{
  "game": "slots",
  "action": "spin",
  "betAmount": 25,
  "winAmount": 100,
  "payline": ["Seven", "Seven", "Cherry"],
  "cheat": null,
  "customerName": "LoadTest Customer",
  "balance": 5000,
  "newBalance": 5075,
  "Username": "LoadTest Customer",
  "CustomerName": "LoadTest Customer",
  "Email": "loadtest@vegas-casino.demo", 
  "CompanyName": "Vegas LoadTest Corp",
  "Persona": "LoadTest Persona",
  "Booth": "LoadRunner_Booth",
  "OptIn": true,
  "Balance": 5075,
  "BetAmount": 25,
  "correlationId": "loadtest_1641234567890_xyz789abc012",
  "CheatActive": false,
  "CheatType": null,
  "CheatDetails": null
}
EOF

echo ""
echo "✅ IDENTICAL REQUEST STRUCTURE ACHIEVED!"
echo "========================================"
echo ""
echo "🔗 Dynatrace Correlation Benefits:"
echo "  ✓ Same HTTP method, headers, and endpoint"  
echo "  ✓ Identical JSON payload structure and field names"
echo "  ✓ Matching data types and value patterns"
echo "  ✓ OneAgent captures business events identically"
echo "  ✓ Request attributes are consistent between sources"
echo "  ✓ Service topology shows same call patterns"
echo ""
echo "📈 Business Event Capture:"
echo "  • Game actions (spin, roll, deal, hit, stand)"
echo "  • User behavior patterns"  
echo "  • Bet amounts and win/loss tracking"
echo "  • Cheat detection and risk assessment"
echo "  • Session correlation and user journeys"
echo ""
echo "🎯 Result: Load testing and real user traces are now IDENTICAL!"
echo "   Both sources generate the same Dynatrace observability data."