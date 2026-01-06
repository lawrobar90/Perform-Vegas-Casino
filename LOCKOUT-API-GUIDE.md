# 🚨 Vegas Casino Lockout API Documentation

## Overview
The Vegas Casino application includes an advanced admin lockout system that can be triggered remotely via API. This is designed to integrate with Dynatrace workflows for automatic fraud detection and user lockout.

## 🔗 API Endpoint
```
POST http://3.209.41.33:8080/api/admin/lockout-user-cheat
```

## 📋 Request Format
The API expects a JSON array of cheat records, typically from a Dynatrace DQL query result.

### Content-Type
```
Content-Type: application/json
```

### Request Body Structure
```json
[
  {
    "json.CustomerName": "username",
    "json.cheatType": "cheat_type", 
    "json.winAmount": numeric_amount
  }
]
```

## 🎯 Example Usage

### Simple Test
```bash
curl -X POST http://3.209.41.33:8080/api/admin/lockout-user-cheat \
  -H "Content-Type: application/json" \
  -d '[{"json.CustomerName": "JohnDoe", "json.cheatType": "win_boost", "json.winAmount": 500}]'
```

### Multiple Violations
```bash
curl -X POST http://3.209.41.33:8080/api/admin/lockout-user-cheat \
  -H "Content-Type: application/json" \
  -d '[
    {"json.CustomerName": "JohnDoe", "json.cheatType": "win_boost", "json.winAmount": 500},
    {"json.CustomerName": "JohnDoe", "json.cheatType": "house_edge", "json.winAmount": 250}
  ]'
```

## 📊 API Response
```json
{
  "success": true,
  "message": "Processed 1 cheat records for 1 unique users",
  "results": [
    {
      "index": 0,
      "username": "JohnDoe",
      "success": true,
      "action": "locked_and_balance_adjusted",
      "cheatViolations": 1,
      "totalWinningsConfiscated": 500,
      "balanceBefore": 1000,
      "balanceAfter": 500,
      "lockReason": "Cheat detected: WIN_BOOST (1 violations, $500 confiscated)"
    }
  ],
  "summary": {
    "totalRecordsProcessed": 1,
    "uniqueUsersLocked": 1,
    "totalWinningsConfiscated": 500
  }
}
```

## 🎮 What Happens When Triggered

1. **User Account Locked**: The specified user is immediately locked out
2. **Balance Adjustment**: Fraudulent winnings are confiscated from user balance  
3. **Real-time Notification**: If user is currently playing, they see immediate lockout screen
4. **Comprehensive Logging**: All lockout actions are logged for audit trails

## 🔒 Lockout Screen Features

When a user is locked out, they see:
- 🚨 **Security Alert**: Clear warning that account is locked
- 📊 **Violation Details**: Specific cheat types and violation counts
- 💰 **Financial Impact**: Amount confiscated and balance adjustment
- ⏰ **Timestamp**: When the lockout occurred
- 🎯 **Professional UI**: Red-themed lockout interface with matrix rain effect

## 🛠 Integration with Dynatrace

### DQL Query Example
```sql
fetch logs
| filter content.event_type == "CASINO_GAME_ACTIVITY" 
| filter content.cheat_active == true
| filter content.severity == "HIGH"
| summarize violations=count(), total_winnings=sum(content.winAmount) by customer=content.CustomerName
| filter violations > 2
```

### Workflow Action
Use the DQL results to call the lockout API:
```javascript
// Dynatrace Workflow Action
const response = await fetch('http://3.209.41.33:8080/api/admin/lockout-user-cheat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(result.records)
});
```

## 🔧 Additional Endpoints

### Check Lockout Status
```
GET /api/admin/lockout-status/{username}
```

### Manual User Lockout
```
POST /api/admin/lockout-user
Content-Type: application/json

{
  "Username": "username",
  "Reason": "Manual lockout reason",
  "Duration": 60
}
```

### Unlock User
```
POST /api/admin/unlock-user
Content-Type: application/json

{
  "Username": "username"
}
```

## ✅ Testing the Implementation

1. **Start a game session** with cheats enabled
2. **Trigger the API** with your username
3. **Observe immediate lockout** - user sees red lockout screen
4. **Check server logs** for lockout confirmation
5. **Verify balance adjustment** in user account

## 🔍 Troubleshooting

- Ensure the server is running on port 8080
- Verify JSON format matches expected structure
- Check server logs for detailed error messages
- Confirm user exists in the system before locking

## 🎯 Live Demo
Visit: http://3.209.41.33:8080
Create account → Start playing → Trigger lockout API → Observe real-time lockout