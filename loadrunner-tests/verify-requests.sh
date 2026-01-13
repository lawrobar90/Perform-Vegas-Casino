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
