        //     });
        //     
        //     // Initialize dice game if starting on dice page
        //     setTimeout(ensureDiceGameReady, 1500);
        // });

        // Manual lockout test function (for debugging)
        window.testLockout = function(username = 'Lawro') {
            console.log('🧪 Testing lockout for:', username);
            fetch(`/api/admin/lockout-status/${username}`)
                .then(response => response.json())
                .then(data => {
                    console.log('🧪 Test result:', data);
                    if (data.locked) {
                        showLockoutScreen(data);
                    } else {
                        console.log('✅ User is not locked');
                    }
                });
        };

        // Force lockout check for current user (debugging)
        window.forceLockoutCheck = function() {
            console.log('🔧 Forcing lockout check...');
            checkLockoutStatus();
        };
        
        // Test function - should work immediately
        console.log('🧪 JavaScript is loading...');
        window.simpleTest = function() {
            console.log('✅ Simple test works!');
            alert('Simple test works!');
        };

        // Manual lockout display test
        window.showTestLockout = function() {
            const testData = {
                locked: true,
                username: 'Lawro',
                reason: 'Test lockout screen',
                timestamp: new Date().toISOString(),
                cheatData: {
                    violations: 5,
                    winningsConfiscated: 15000,
                    balanceAdjustment: 'Reset to $1000'
                }
            };
            console.log('🧪 Showing test lockout screen with data:', testData);
            showLockoutScreen(testData);
        };
