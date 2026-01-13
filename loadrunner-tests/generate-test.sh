#!/bin/bash

# Vegas Casino LoadRunner Test Generator
# Generates LoadRunner scripts that create HTTP requests identical to real users
# for proper Dynatrace correlation and business event capture

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="${SCRIPT_DIR}/templates"
OUTPUT_DIR="${SCRIPT_DIR}/generated"
SCENARIOS_DIR="${SCRIPT_DIR}/scenarios"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
BASE_URL="http://localhost:8080"
SCENARIO="realistic-gaming"
USER_COUNT=50
DURATION="10m"
CHEAT_ENABLED=1
INITIAL_BALANCE=5000

usage() {
    echo -e "${BLUE}Vegas Casino LoadRunner Test Generator${NC}"
    echo ""
    echo "Generates LoadRunner scripts that match real user HTTP requests exactly"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -u, --url URL           Base URL of Vegas Casino (default: http://localhost:8080)"
    echo "  -s, --scenario NAME     Test scenario (default: realistic-gaming)"
    echo "  -c, --users COUNT       Number of virtual users (default: 50)" 
    echo "  -d, --duration TIME     Test duration (default: 10m)"
    echo "  -b, --balance AMOUNT    Initial user balance (default: 5000)"
    echo "  --enable-cheats         Enable cheat simulation (default: enabled)"
    echo "  --disable-cheats        Disable cheat simulation"
    echo "  -h, --help              Show this help"
    echo ""
    echo "Available scenarios:"
    echo "  realistic-gaming        Normal casino behavior"
    echo "  peak-traffic           High-volume gaming" 
    echo "  cheat-detection        Heavy cheat usage for detection testing"
    echo ""
    echo "Examples:"
    echo "  $0 -s peak-traffic -c 200 -d 30m"
    echo "  $0 --disable-cheats -u https://vegas-casino.example.com"
    echo "  $0 -s cheat-detection --enable-cheats"
}

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1" >&2
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            BASE_URL="$2"
            shift 2
            ;;
        -s|--scenario)
            SCENARIO="$2"
            shift 2
            ;;
        -c|--users)
            USER_COUNT="$2"
            shift 2
            ;;
        -d|--duration)
            DURATION="$2"
            shift 2
            ;;
        -b|--balance)
            INITIAL_BALANCE="$2"
            shift 2
            ;;
        --enable-cheats)
            CHEAT_ENABLED=1
            shift
            ;;
        --disable-cheats)
            CHEAT_ENABLED=0
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Validate inputs
if [[ ! "$USER_COUNT" =~ ^[0-9]+$ ]] || [[ $USER_COUNT -le 0 ]]; then
    error "User count must be a positive integer"
fi

if [[ ! "$INITIAL_BALANCE" =~ ^[0-9]+$ ]] || [[ $INITIAL_BALANCE -le 0 ]]; then
    error "Initial balance must be a positive integer"
fi

# Create output directory
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEST_NAME="VegasCasino_${SCENARIO}_${USER_COUNT}users_${TIMESTAMP}"
TEST_DIR="${OUTPUT_DIR}/${TEST_NAME}"

log "Creating Vegas Casino LoadRunner test: ${TEST_NAME}"

mkdir -p "${TEST_DIR}"

# Generate user profiles
log "Generating ${USER_COUNT} realistic user profiles..."

USERS_FILE="${TEST_DIR}/users.csv"
echo "Username,CustomerName,Email,CompanyName,Persona,InitialBalance,CheatEnabled" > "${USERS_FILE}"

for i in $(seq 1 $USER_COUNT); do
    USERNAME="LoadTest_User_$(printf "%04d" $i)"
    CUSTOMER_NAME="Casino Player $i"
    EMAIL="player${i}@loadtest.demo"
    COMPANY_NAME="LoadTest Gaming Co"
    PERSONA=$([ $((i % 3)) -eq 0 ] && echo "HighRoller" || [ $((i % 3)) -eq 1 ] && echo "CasualGamer" || echo "Conservative")
    USER_CHEAT=$([[ $CHEAT_ENABLED -eq 1 && $((i % 4)) -eq 0 ]] && echo "1" || echo "0")
    
    echo "${USERNAME},${CUSTOMER_NAME},${EMAIL},${COMPANY_NAME},${PERSONA},${INITIAL_BALANCE},${USER_CHEAT}" >> "${USERS_FILE}"
done

# Generate LoadRunner script from template
log "Generating LoadRunner script from Vegas Casino template..."

SCRIPT_FILE="${TEST_DIR}/${TEST_NAME}.c"

# Read template and substitute variables
sed "s|{{BASE_URL}}|${BASE_URL}|g; \
     s|{{CUSTOMER_NAME}}|LoadTest Customer|g; \
     s|{{EMAIL}}|loadtest@vegas-casino.demo|g; \
     s|{{COMPANY_NAME}}|Vegas LoadTest Corp|g; \
     s|{{PERSONA}}|LoadTest Persona|g; \
     s|{{INITIAL_BALANCE}}|${INITIAL_BALANCE}|g; \
     s|{{CHEAT_SIMULATION}}|${CHEAT_ENABLED}|g" \
     "${TEMPLATES_DIR}/vegas-casino-template.c" > "${SCRIPT_FILE}"

# Generate test configuration
log "Creating test configuration..."

CONFIG_FILE="${TEST_DIR}/test-config.json"
cat > "${CONFIG_FILE}" << EOF
{
  "testInfo": {
    "name": "${TEST_NAME}",
    "description": "Vegas Casino LoadRunner test with real user simulation",
    "scenario": "${SCENARIO}",
    "generated": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
    "baseUrl": "${BASE_URL}"
  },
  "loadProfile": {
    "virtualUsers": ${USER_COUNT},
    "duration": "${DURATION}",
    "rampUpTime": "2m",
    "thinkTime": {
      "min": 1,
      "max": 5,
      "distribution": "uniform"
    }
  },
  "gameSimulation": {
    "cheatsEnabled": ${CHEAT_ENABLED},
    "initialBalance": ${INITIAL_BALANCE},
    "gameDistribution": {
      "slots": 60,
      "dice": 20,
      "blackjack": 20
    }
  },
  "dynatraceIntegration": {
    "requestTagging": true,
    "businessEvents": true,
    "realUserCorrelation": true,
    "identicalPayloads": true
  },
  "files": {
    "script": "${TEST_NAME}.c",
    "users": "users.csv",
    "config": "test-config.json"
  }
}
EOF

# Generate runtime settings
log "Creating LoadRunner runtime settings..."

RTI_FILE="${TEST_DIR}/${TEST_NAME}.rti"
cat > "${RTI_FILE}" << EOF
[General]
XlBridgeTimeout=120
ContinueOnError=0
AutomaticTransactions=0
AutomaticTransactionPerFunc=1
automatic_nested_transactions=1

[ThinkTime]
Options=NOTHINK
Factor=1.000000
LimitFlag=0
Limit=1
ThinkTimeRandomLow=50
ThinkTimeRandomHigh=150

[Log]
LogOptions=LogExtended
MsgClassData=0
MsgClassParameters=0
MsgClassFull=0

[RTS]
LoadImages=1
LoadNonHtmlResources=1
NonHtmlRecordLevel=3
NonHtmlRecordMode=0
SimulateCache=1
SimulateCacheSize=0
MaxConnections=6
MaxConnectionsPerServer=2
UserAgent=Vegas-Casino-LoadRunner-Simulation
SendUrlencodedData=0

[WEB]
HttpVer=1.1
KeepAlive=Yes
SearchForImages=1
CacheImages=1
GraphicsLevel=4
MaxConnectionsPerHost=2
EOF

# Generate execution script
log "Creating test execution script..."

RUN_SCRIPT="${TEST_DIR}/run_test.sh"
cat > "${RUN_SCRIPT}" << 'EOF'
#!/bin/bash

# Vegas Casino LoadRunner Test Execution Script
# This script runs the generated LoadRunner test

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_NAME="$(basename "${SCRIPT_DIR}")"

echo "🎰 Starting Vegas Casino LoadRunner Test: ${TEST_NAME}"
echo "📁 Test Directory: ${SCRIPT_DIR}"
echo "🕐 Start Time: $(date)"
echo ""

# Check if LoadRunner Controller is available
if ! command -v mdrv &> /dev/null; then
    echo "❌ LoadRunner Controller (mdrv) not found in PATH"
    echo "💡 Please ensure LoadRunner is installed and available"
    echo "💡 Alternative: Import ${TEST_NAME}.c into LoadRunner VuGen manually"
    exit 1
fi

echo "✅ LoadRunner Controller found"
echo "🚀 Executing test scenario..."

# Run the test (customize based on your LoadRunner setup)
mdrv -usr "${TEST_NAME}.c" -rti "${TEST_NAME}.rti" -cfg test_config.cfg

echo ""
echo "🏁 Test execution completed at $(date)"
echo "📊 Check LoadRunner results for detailed analysis"
echo "📈 Dynatrace should show identical traces to real users"
EOF

chmod +x "${RUN_SCRIPT}"

# Generate README for the test
README_FILE="${TEST_DIR}/README.md"
cat > "${README_FILE}" << EOF
# Vegas Casino LoadRunner Test: ${TEST_NAME}

## Overview
This LoadRunner test generates HTTP requests that are **identical** to real Vegas Casino users, ensuring proper Dynatrace correlation and business event capture.

## Test Configuration
- **Scenario**: ${SCENARIO}
- **Virtual Users**: ${USER_COUNT}
- **Duration**: ${DURATION} 
- **Base URL**: ${BASE_URL}
- **Cheats Enabled**: ${CHEAT_ENABLED}
- **Initial Balance**: \$${INITIAL_BALANCE}

## Files Generated
- \`${TEST_NAME}.c\` - Main LoadRunner script
- \`${TEST_NAME}.rti\` - Runtime settings
- \`users.csv\` - User profile data
- \`test-config.json\` - Test configuration
- \`run_test.sh\` - Execution script

## Real User Correlation
This test generates HTTP requests with:
- ✅ Identical request payloads to frontend
- ✅ Same headers and user-agent strings  
- ✅ Matching correlation IDs and metadata
- ✅ Business event structure for OneAgent capture
- ✅ Cheat detection simulation patterns

## Execution
1. Import \`${TEST_NAME}.c\` into LoadRunner VuGen
2. Configure runtime settings using \`${TEST_NAME}.rti\`
3. Set user data to \`users.csv\`
4. Run test with ${USER_COUNT} virtual users

Or use the automated script:
\`\`\`bash
./run_test.sh
\`\`\`

## Expected Dynatrace Results
- Service calls identical to real users
- Business events captured via OneAgent
- Request attributes matching frontend behavior
- Same distributed trace patterns
- Identical JSON payloads and parameters

## Verification
Compare Dynatrace traces between:
1. This LoadRunner test execution
2. Real user sessions from the browser

The requests should be indistinguishable in Dynatrace.
EOF

log "✅ Vegas Casino LoadRunner test generated successfully!"
log "📁 Test location: ${TEST_DIR}"
log "📋 Test configuration:"
log "   • Name: ${TEST_NAME}"
log "   • Users: ${USER_COUNT}"
log "   • Duration: ${DURATION}"
log "   • URL: ${BASE_URL}"
log "   • Cheats: $([[ $CHEAT_ENABLED -eq 1 ]] && echo "Enabled" || echo "Disabled")"
log ""
log "🎯 Next steps:"
log "   1. Import ${TEST_NAME}.c into LoadRunner VuGen"
log "   2. Load users.csv as parameter data"
log "   3. Execute test with ${USER_COUNT} virtual users"
log "   4. Compare Dynatrace traces with real users"
log ""
log "📖 See README.md in test directory for detailed instructions"

echo "${TEST_DIR}"