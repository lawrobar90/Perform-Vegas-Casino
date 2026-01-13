#!/bin/bash

# Vegas Casino Request Comparison Tool
# Analyzes differences between real user requests and load test requests
# Helps ensure identical HTTP request structure for Dynatrace correlation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VEGAS_CASINO_DIR="$(dirname "${SCRIPT_DIR}")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

analyze_real_user_structure() {
    log "🔍 Analyzing Real User Request Structure from Vegas Casino Frontend..."
    
    # Extract real user request patterns from the frontend code
    FRONTEND_FILE="${VEGAS_CASINO_DIR}/public/index.html"
    
    if [[ ! -f "$FRONTEND_FILE" ]]; then
        error "Frontend file not found: $FRONTEND_FILE"
        return 1
    fi
    
    echo ""
    echo "📊 REAL USER REQUEST ANALYSIS"
    echo "================================"
    
    # Analyze Slots API calls
    echo ""
    echo "🎰 SLOTS GAME REQUESTS:"
    echo "----------------------"
    
    grep -A 20 "fetch('/api/slots/spin'" "$FRONTEND_FILE" | head -30 || true
    
    # Analyze Dice API calls  
    echo ""
    echo "🎲 DICE GAME REQUESTS:"
    echo "---------------------"
    
    grep -A 20 "fetch('/api/dice/roll'" "$FRONTEND_FILE" | head -30 || true
    
    # Analyze Blackjack API calls
    echo ""
    echo "🃏 BLACKJACK GAME REQUESTS:"
    echo "--------------------------"
    
    grep -A 20 "fetch('/api/blackjack/" "$FRONTEND_FILE" | head -30 || true
    
    echo ""
}

analyze_payload_structure() {
    log "🔍 Analyzing Request Payload Structures..."
    
    FRONTEND_FILE="${VEGAS_CASINO_DIR}/public/index.html"
    
    echo ""
    echo "📦 REQUEST PAYLOAD ANALYSIS"
    echo "==========================="
    
    # Extract payload construction patterns
    echo ""
    echo "🎰 Slots Payload Structure:"
    echo "---------------------------"
    
    # Find slots payload construction
    awk '/sendSlotResult.*function/,/fetch.*slots.*spin/ {
        if (/const payload = {/ || /game:/ || /action:/ || /betAmount:/ || /winAmount:/ || /customerName:/ || /Username:/ || /CheatActive:/) {
            print "  " $0
        }
    }' "$FRONTEND_FILE" | head -20
    
    echo ""
    echo "🎲 Dice Payload Structure:"
    echo "-------------------------"
    
    # Find dice payload construction  
    awk '/sendDiceResult.*function/,/fetch.*dice.*roll/ {
        if (/const payload = {/ || /Username:/ || /BetAmount:/ || /BetType:/ || /Game:/ || /Action:/ || /CheatActive:/) {
            print "  " $0
        }
    }' "$FRONTEND_FILE" | head -20
    
    echo ""
    echo "🃏 Blackjack Payload Structure:"
    echo "------------------------------"
    
    # Find blackjack payload construction
    awk '/sendBlackjackAction.*function/,/fetch.*blackjack/ {
        if (/const payload = {/ || /Username:/ || /BetAmount:/ || /Game:/ || /Action:/ || /CheatActive:/) {
            print "  " $0
        }
    }' "$FRONTEND_FILE" | head -20
}

check_header_consistency() {
    log "🔍 Checking HTTP Header Consistency..."
    
    FRONTEND_FILE="${VEGAS_CASINO_DIR}/public/index.html"
    
    echo ""
    echo "📡 HTTP HEADERS ANALYSIS"
    echo "========================"
    
    echo ""
    echo "Real User Headers:"
    echo "------------------"
    
    # Extract headers from fetch calls
    grep -A 10 -B 2 "headers:" "$FRONTEND_FILE" | grep -E "(Content-Type|User-Agent|Accept|Cache-Control)" || echo "  Standard browser headers used"
    
    echo ""
    echo "LoadRunner Template Headers:"
    echo "---------------------------"
    
    if [[ -f "${SCRIPT_DIR}/templates/vegas-casino-template.c" ]]; then
        grep -E "web_add_header" "${SCRIPT_DIR}/templates/vegas-casino-template.c" || echo "  No custom headers found"
    else
        echo "  LoadRunner template not found"
    fi
}

compare_request_flow() {
    log "🔍 Comparing Request Flow Patterns..."
    
    echo ""
    echo "🔄 REQUEST FLOW COMPARISON"
    echo "=========================="
    
    echo ""
    echo "Real User Flow (from frontend):"
    echo "------------------------------"
    echo "1. User interacts with game UI"
    echo "2. Game logic calculates result"
    echo "3. Balance updated locally"
    echo "4. HTTP POST to API endpoint"
    echo "5. Payload includes complete game state"
    echo "6. Cheat detection data included"
    echo "7. Correlation ID generated"
    
    echo ""
    echo "LoadRunner Flow (from template):"
    echo "--------------------------------"
    echo "1. LoadRunner script starts"
    echo "2. Generate realistic game data"
    echo "3. Build identical payload structure"
    echo "4. HTTP POST to same API endpoint"
    echo "5. Include same metadata fields"
    echo "6. Simulate cheat patterns"
    echo "7. Use matching correlation IDs"
    
    echo ""
}

verify_dynatrace_correlation() {
    log "🔍 Verifying Dynatrace Correlation Requirements..."
    
    echo ""
    echo "🔗 DYNATRACE CORRELATION CHECKLIST"
    echo "=================================="
    
    echo ""
    echo "✅ Requirements for Identical Traces:"
    echo "------------------------------------"
    echo "  ✓ Same HTTP method (POST)"
    echo "  ✓ Same endpoint URLs (/api/slots/spin, /api/dice/roll, etc.)"
    echo "  ✓ Identical request headers (Content-Type: application/json)"
    echo "  ✓ Same JSON payload structure"
    echo "  ✓ Matching field names and data types"
    echo "  ✓ Similar value ranges and patterns"
    echo "  ✓ Correlation IDs for request tracking"
    echo "  ✓ User-Agent string consistency"
    
    echo ""
    echo "⚠️  Potential Discrepancy Sources:"
    echo "---------------------------------"
    echo "  • Different User-Agent strings"
    echo "  • Missing or extra payload fields" 
    echo "  • Timestamp format differences"
    echo "  • Balance calculation variations"
    echo "  • Cheat detection parameter ranges"
    echo "  • Correlation ID generation patterns"
    
    echo ""
}

suggest_improvements() {
    log "💡 Suggesting Improvements for Identical Requests..."
    
    echo ""
    echo "🚀 RECOMMENDATIONS"
    echo "=================="
    
    echo ""
    echo "1. Header Standardization:"
    echo "-------------------------"
    echo "  • Use exact same User-Agent: 'Vegas-Casino-UI'"
    echo "  • Include Accept: 'application/json, text/plain, */*'"
    echo "  • Add Cache-Control: 'no-cache' for consistency"
    
    echo ""
    echo "2. Payload Field Matching:"
    echo "-------------------------"
    echo "  • Ensure ALL frontend fields are in LoadRunner payload"
    echo "  • Match capitalization exactly (Username vs username)"
    echo "  • Include optional fields even if null"
    echo "  • Use same data type formats (numbers vs strings)"
    
    echo ""
    echo "3. Correlation ID Patterns:"
    echo "--------------------------"
    echo "  • Use same prefix pattern: 'ui_' vs 'loadtest_'"
    echo "  • Match timestamp precision (milliseconds)"
    echo "  • Include same random string generation"
    
    echo ""
    echo "4. Business Logic Consistency:"
    echo "-----------------------------"
    echo "  • Simulate realistic win/loss ratios"
    echo "  • Match cheat detection probability ranges"
    echo "  • Use same balance calculation logic"
    echo "  • Include error scenarios (insufficient balance, etc.)"
    
    echo ""
    echo "5. Request Timing:"
    echo "-----------------"
    echo "  • Add realistic think times between requests"
    echo "  • Simulate session-based gaming patterns"
    echo "  • Include idle periods and burst activity"
    
    echo ""
}

generate_verification_script() {
    log "📝 Generating request verification script..."
    
    VERIFY_SCRIPT="${SCRIPT_DIR}/verify-requests.sh"
    
    cat > "$VERIFY_SCRIPT" << 'EOF'
#!/bin/bash

# Vegas Casino Request Verification Script
# Compares actual HTTP requests between real users and load tests

echo "🔍 Vegas Casino Request Verification"
echo "===================================="
echo ""

# Function to capture real user requests
capture_real_user_requests() {
    echo "📱 Instructions for capturing real user requests:"
    echo "1. Open Vegas Casino in browser developer tools"
    echo "2. Go to Network tab"
    echo "3. Filter by XHR/Fetch requests"
    echo "4. Play slots, dice, or blackjack games"
    echo "5. Copy request as cURL from Network tab"
    echo "6. Save to real_user_request.txt"
    echo ""
}

# Function to capture LoadRunner requests  
capture_loadrunner_requests() {
    echo "🤖 Instructions for capturing LoadRunner requests:"
    echo "1. Run LoadRunner test with network monitoring"
    echo "2. Export request details from LoadRunner logs"
    echo "3. Or use tcpdump/Wireshark to capture HTTP traffic"
    echo "4. Save to loadrunner_request.txt"  
    echo ""
}

# Function to compare requests
compare_requests() {
    echo "⚖️  Comparing request structures..."
    
    if [[ -f "real_user_request.txt" && -f "loadrunner_request.txt" ]]; then
        echo "Files found - performing comparison:"
        echo ""
        
        echo "Differences found:"
        diff real_user_request.txt loadrunner_request.txt || echo "Requests are identical! ✅"
    else
        echo "❌ Please create real_user_request.txt and loadrunner_request.txt first"
        echo "   Use the capture instructions above"
    fi
}

case "${1:-help}" in
    "capture-real")
        capture_real_user_requests
        ;;
    "capture-lr")
        capture_loadrunner_requests
        ;;
    "compare")
        compare_requests
        ;;
    *)
        echo "Usage: $0 [capture-real|capture-lr|compare]"
        echo ""
        capture_real_user_requests
        capture_loadrunner_requests
        compare_requests
        ;;
esac
EOF

    chmod +x "$VERIFY_SCRIPT"
    log "✅ Verification script created: $VERIFY_SCRIPT"
}

main() {
    echo ""
    echo "🎰 VEGAS CASINO REQUEST ANALYSIS TOOL"
    echo "====================================="
    
    analyze_real_user_structure
    analyze_payload_structure  
    check_header_consistency
    compare_request_flow
    verify_dynatrace_correlation
    suggest_improvements
    generate_verification_script
    
    echo ""
    log "✅ Analysis complete!"
    log "📋 Summary: Use the LoadRunner template to generate requests identical to real users"
    log "🔧 Run: ./generate-test.sh to create a LoadRunner test"
    log "✔️  Run: ./verify-requests.sh to validate request consistency"
    echo ""
}

main "$@"