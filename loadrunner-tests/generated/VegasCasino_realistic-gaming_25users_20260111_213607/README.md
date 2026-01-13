# Vegas Casino LoadRunner Test: VegasCasino_realistic-gaming_25users_20260111_213607

## Overview
This LoadRunner test generates HTTP requests that are **identical** to real Vegas Casino users, ensuring proper Dynatrace correlation and business event capture.

## Test Configuration
- **Scenario**: realistic-gaming
- **Virtual Users**: 25
- **Duration**: 5m 
- **Base URL**: http://localhost:8080
- **Cheats Enabled**: 1
- **Initial Balance**: $5000

## Files Generated
- `VegasCasino_realistic-gaming_25users_20260111_213607.c` - Main LoadRunner script
- `VegasCasino_realistic-gaming_25users_20260111_213607.rti` - Runtime settings
- `users.csv` - User profile data
- `test-config.json` - Test configuration
- `run_test.sh` - Execution script

## Real User Correlation
This test generates HTTP requests with:
- ✅ Identical request payloads to frontend
- ✅ Same headers and user-agent strings  
- ✅ Matching correlation IDs and metadata
- ✅ Business event structure for OneAgent capture
- ✅ Cheat detection simulation patterns

## Execution
1. Import `VegasCasino_realistic-gaming_25users_20260111_213607.c` into LoadRunner VuGen
2. Configure runtime settings using `VegasCasino_realistic-gaming_25users_20260111_213607.rti`
3. Set user data to `users.csv`
4. Run test with 25 virtual users

Or use the automated script:
```bash
./run_test.sh
```

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
