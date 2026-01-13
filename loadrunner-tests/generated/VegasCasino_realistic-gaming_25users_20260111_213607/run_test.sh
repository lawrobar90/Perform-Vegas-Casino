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
