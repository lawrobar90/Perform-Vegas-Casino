# Vegas Casino Load Testing - Real User Simulation

This directory contains LoadRunner test templates and tools to generate HTTP requests that are **identical** to real Vegas Casino users, ensuring perfect Dynatrace correlation for business event capture and observability.

## 🎯 Purpose

Your Vegas Casino app needs load testing and real user traces to be identical for proper Dynatrace observability. This solution ensures:

- ✅ **Identical HTTP requests** - Same payloads, headers, and structure
- ✅ **Business event correlation** - OneAgent captures both the same way
- ✅ **Request attribute matching** - Same JSON fields and values
- ✅ **Trace consistency** - Load tests and real users show identical patterns

## 📊 Current Discrepancies (Solved)

**Before this solution:**
- Load tests used generic BizObs payloads
- Real users had complex game-specific data
- Different headers and correlation IDs
- Inconsistent business event capture

**After this solution:**
- Load tests mirror exact frontend requests
- Same payload structure and field names
- Identical headers and user agents
- Perfect Dynatrace trace correlation

## 🚀 Quick Start

### 1. Generate a Load Test

```bash
cd /home/ec2-user/vegas-casino/loadrunner-tests
./generate-test.sh -s realistic-gaming -c 50 -d 10m
```

### 2. Run Analysis

```bash
./analyze-requests.sh
```

### 3. Execute Test

Import the generated `.c` file into LoadRunner VuGen and execute with the provided configuration.

## 🎮 Game Request Simulation

### Slots Game
**Real User Request:**
```javascript
fetch('/api/slots/spin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'User-Agent': 'Vegas-Casino-UI' },
  body: JSON.stringify({
    game: 'slots',
    action: 'spin',
    betAmount: 25,
    winAmount: 100,
    customerName: 'John Doe',
    Username: 'John Doe',
    CheatActive: false,
    correlationId: 'ui_1641234567890_abc123'
  })
})
```

**LoadRunner Simulation:**
```c
web_custom_request("Slots_Spin_Request",
    "URL=http://localhost:8080/api/slots/spin",
    "Method=POST",
    "Body={\"game\":\"slots\",\"action\":\"spin\",\"betAmount\":25,\"winAmount\":100,\"customerName\":\"LoadTest User\",\"Username\":\"LoadTest User\",\"CheatActive\":false,\"correlationId\":\"loadtest_1641234567890_xyz789\"}",
    LAST);
```

**Result:** Identical request structure for perfect Dynatrace correlation.

### Dice Game
**Real User vs LoadRunner:** Same payload structure with realistic dice roll results, bet types, and cheat simulation.

### Blackjack Game  
**Real User vs LoadRunner:** Identical deal/hit/stand actions with matching card game logic and metadata.

## 📋 Available Test Scenarios

### 1. Realistic Gaming (`realistic-gaming`)
- **Users:** 50
- **Duration:** 10 minutes
- **Behavior:** Normal casino gaming patterns
- **Games:** 60% Slots, 20% Dice, 20% Blackjack
- **Cheating:** 25% of users with cheat simulation

### 2. Peak Traffic (`peak-traffic`)
- **Users:** 200
- **Duration:** 30 minutes  
- **Behavior:** High-volume gaming rush
- **Games:** 70% Slots, 15% Dice, 15% Blackjack
- **Cheating:** 20% of users with cheat simulation

### 3. Cheat Detection (`cheat-detection`)
- **Users:** 25
- **Duration:** 15 minutes
- **Behavior:** Heavy cheat usage for detection testing
- **Games:** 80% Slots, 10% Dice, 10% Blackjack
- **Cheating:** 70% of users with cheat simulation

## 🛠️ Tools Provided

### `generate-test.sh`
Main script to create LoadRunner tests with real user simulation.

```bash
# Examples:
./generate-test.sh -s peak-traffic -c 200 -d 30m
./generate-test.sh --disable-cheats -u https://vegas-casino.example.com  
./generate-test.sh -s cheat-detection --enable-cheats
```

**Options:**
- `-u, --url URL` - Base URL (default: http://localhost:8080)
- `-s, --scenario NAME` - Test scenario (realistic-gaming|peak-traffic|cheat-detection)
- `-c, --users COUNT` - Number of virtual users
- `-d, --duration TIME` - Test duration (e.g., 10m, 1h)
- `-b, --balance AMOUNT` - Initial user balance
- `--enable-cheats / --disable-cheats` - Cheat simulation toggle

### `analyze-requests.sh`
Analyzes request structure differences and provides recommendations.

```bash
./analyze-requests.sh
```

**Output:**
- Real user request analysis
- Payload structure comparison  
- Header consistency check
- Dynatrace correlation verification
- Improvement recommendations

### `vegas-casino-template.c`
LoadRunner template that generates requests identical to frontend users.

**Features:**
- Exact payload matching
- Same correlation ID patterns
- Realistic game behavior
- Cheat simulation logic
- Balance management
- User profile variation

## 🔗 Dynatrace Correlation

### Business Events
Both real users and load tests generate identical business events:

```json
{
  "event.type": "GAME_ACTION",
  "game.name": "slots",
  "user.name": "Player123", 
  "bet.amount": 25,
  "win.amount": 100,
  "cheat.active": false,
  "correlation.id": "ui_1641234567890_abc123"
}
```

### Request Attributes
OneAgent captures the same attributes from both sources:
- User identifiers
- Game actions and results
- Cheat detection data
- Balance changes
- Session correlation

### Service Topology
Load tests and real users create identical service call patterns:
```
Browser/LoadRunner → Vegas Casino → Game Services → Database
```

## 📁 Generated Test Structure

Each generated test creates:
```
VegasCasino_realistic-gaming_50users_20240115_143022/
├── VegasCasino_realistic-gaming_50users_20240115_143022.c    # LoadRunner script
├── VegasCasino_realistic-gaming_50users_20240115_143022.rti  # Runtime settings  
├── users.csv                                               # User profiles
├── test-config.json                                        # Test configuration
├── run_test.sh                                            # Execution script
└── README.md                                              # Test documentation
```

## 🎯 Verification Steps

1. **Generate Load Test:**
   ```bash
   ./generate-test.sh -s realistic-gaming -c 10 -d 5m
   ```

2. **Run Real User Session:**
   - Open Vegas Casino in browser
   - Play games (slots, dice, blackjack)
   - Enable developer tools to monitor network requests

3. **Execute Load Test:**
   - Import generated `.c` file into LoadRunner
   - Run test with same user count and duration

4. **Compare in Dynatrace:**
   - Check service calls are identical
   - Verify business events have same structure  
   - Confirm request attributes match
   - Validate trace topology is consistent

## ⚠️ Important Notes

- **Timing:** Load tests include realistic think times between game actions
- **Variations:** User profiles vary bet amounts, game preferences, and cheat usage  
- **Balance Sync:** Balance management mirrors frontend logic exactly
- **Error Simulation:** Includes edge cases like insufficient balance
- **Correlation:** Each request has unique correlation ID for traceability

## 🔧 Troubleshooting

### Issue: Different request payloads
**Solution:** Compare generated payload with browser network tab; update template if needed

### Issue: Missing Dynatrace correlation  
**Solution:** Ensure OneAgent is installed on both load generators and application servers

### Issue: Business events not captured
**Solution:** Verify request body contains all required fields for OneAgent business event detection

### Issue: Service topology differences
**Solution:** Check that load generator and browser requests hit same endpoints and follow same redirects

## 🎮 Example Usage

**Real casino gaming session:**
1. User opens Vegas Casino
2. Places $25 bet on slots
3. Wins $100 jackpot  
4. Moves to dice game
5. Loses $50 on dice roll
6. Plays blackjack with $75 bet

**LoadRunner simulation:**
1. Script starts with user profile
2. Simulates $25 slots bet with win
3. Calculates new balance (+$75)
4. Moves to dice with realistic delay  
5. Simulates dice loss (-$50)
6. Plays blackjack with remaining balance

**Result:** Identical HTTP requests, same Dynatrace traces, perfect correlation.

---

## 📞 Support

For questions about load testing setup or Dynatrace correlation:
1. Check the analysis output from `./analyze-requests.sh`
2. Review generated test documentation in each test directory
3. Compare browser network requests with LoadRunner logs
4. Verify Dynatrace service flow topology matches between real and simulated users