        console.log('🚀 Vegas Casino SPA Starting...');
        
        // Test function - should work immediately
        console.log('🧪 JavaScript is loading...');
        window.simpleTest = function() {
            console.log('✅ Simple test works!');
            alert('Simple test works!');
        };

        // Manual lockout test (working)
        window.testLockout = function() {
            alert('Lockout test - showing red warning screen');
            showRealLockoutScreen({
                locked: true,
                username: 'Lawro', 
                reason: 'Test lockout',
                timestamp: new Date().toISOString()
            });
        };

        // Show professional lockout screen with real data (ENHANCED for instant display)
        function showRealLockoutScreen(lockoutData) {
            console.log('🚨 Showing INSTANT lockout screen for:', lockoutData);
            window.isLockoutScreenShowing = true;
            
            // Create instant overlay that appears on top of current content
            const lockoutOverlay = document.createElement('div');
            lockoutOverlay.id = 'dynamic-lockout-overlay';
            lockoutOverlay.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #8B0000 100%) !important;
                z-index: 10000 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-family: Arial, sans-serif !important;
                color: white !important;
                animation: lockoutAppear 0.5s ease-out !important;
            `;
            
            lockoutOverlay.innerHTML = `
                <style>
                    @keyframes lockoutAppear {
                        from { opacity: 0; transform: scale(0.8); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    @keyframes alertPulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                </style>
                <div style="text-align: center; max-width: 600px; padding: 40px; background: rgba(0,0,0,0.4); border-radius: 15px; border: 3px solid #ff0000; box-shadow: 0 0 50px rgba(255,0,0,0.5);">
                    <div style="font-size: 5rem; margin-bottom: 20px; animation: alertPulse 1s infinite;">🚨</div>
                    <h1 style="font-size: 3.5rem; margin-bottom: 30px; text-shadow: 3px 3px 6px rgba(0,0,0,0.8); color: #ff4444; font-weight: bold;">ACCOUNT LOCKED</h1>
                    <div style="background: rgba(139,0,0,0.6); padding: 25px; border-radius: 10px; margin-bottom: 25px; border: 2px solid #ff4444;">
                        <h2 style="color: #ffcccc; margin-bottom: 20px; font-size: 1.3rem;">⚡ REAL-TIME SECURITY ENFORCEMENT ⚡</h2>
                        <div style="text-align: left; font-size: 1.1rem; line-height: 2;">
                            <p><strong>User:</strong> <span style="color: #ff6666;">${lockoutData.username || 'Unknown'}</span></p>
                            <p><strong>Reason:</strong> <span style="color: #ff6666;">${lockoutData.reason || 'Security violation detected'}</span></p>
                            <p><strong>Time:</strong> <span style="color: #ff6666;">${new Date(lockoutData.timestamp || Date.now()).toLocaleString()}</span></p>
                            <p><strong>Status:</strong> <span style="color: #ff3333; font-weight: bold;">IMMEDIATELY ENFORCED</span></p>
                        </div>
                    </div>
                    <div style="font-size: 1rem; color: #ffdddd; line-height: 1.8; margin-bottom: 20px;">
                        <p><strong>🚨 SESSION TERMINATED INSTANTLY</strong></p>
                        <p>This real-time lockout was triggered by Dynatrace's fraud detection system.</p>
                        <p><strong>No refresh required - enforcement is immediate!</strong></p>
                    </div>
                    <div style="font-size: 0.9rem; color: #ff9999; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                        <p>⚡ Real-time Security • 🎯 Instant Enforcement • 🛡️ Dynatrace Powered</p>
                    </div>
                </div>
            `;
            
            // Remove existing overlay if present
            const existing = document.getElementById('dynamic-lockout-overlay');
            if (existing) existing.remove();
            
            // Add overlay to page - appears instantly over current content
            document.body.appendChild(lockoutOverlay);
            document.body.style.overflow = 'hidden';
        }

        // Check lockout status when page loads
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 Page loaded - performing lockout check');
            checkOriginalLockoutStatus();
        });

        // Also check if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkOriginalLockoutStatus);
        } else {
            checkOriginalLockoutStatus();
        }
        
        // Replace my simple lockout checker with integrated version
        function checkOriginalLockoutStatus() {
            // Get username from URL or default to 'Lawro' for demo
            const urlParams = new URLSearchParams(window.location.search);
            const username = urlParams.get('user') || 'Lawro';
            
            console.log('🔍 Checking lockout status for:', username);
            
            fetch(`/api/admin/lockout-status/${username}`)
                .then(response => response.json())
                .then(data => {
                    console.log('📋 Lockout check result:', data);
                    
                    if (data.locked) {
                        console.log('🚨 User is locked - showing lockout screen');
                        showRealLockoutScreen(data);
                    } else {
                        console.log('✅ User is not locked - starting Vegas Casino normally');
                        // Start the original Vegas Casino router system
                        window.router = new VegasRouter();
                        router.init();
                    }
                })
                .catch(error => {
                    console.error('❌ Error checking lockout status:', error);
                    // Fallback: start normal casino
                    window.router = new VegasRouter();
                    router.init();
                });
        }
        
        console.log('✅ Lockout system initialized');
        
        // ===== ORIGINAL VEGAS CASINO CODE CONTINUES =====
        
        // Initialize Socket.IO connection for lockout notifications (with error handling)
        let socket;
        try {
            socket = io();
        } catch (error) {
            console.warn('Socket.IO initialization failed:', error);
            socket = { on: () => {}, emit: () => {} }; // Mock socket for fallback
        }
        
        // Slots Game Data - Dynatrace Observability Platform Symbols
        const slotSymbols = [
            { name: 'Smartscape', emoji: '🌐', color: '#6C2C9C', rarity: 'common' },
            { name: 'Application', emoji: '📱', color: '#1496FF', rarity: 'common' },
            { name: 'Database', emoji: '🗄️', color: '#73BE28', rarity: 'common' },
            { name: 'Server', emoji: '🖥️', color: '#FFD23F', rarity: 'common' },
            { name: 'Cloud', emoji: '☁️', color: '#00D4FF', rarity: 'common' },
            { name: 'Security', emoji: '🛡️', color: '#FFA86B', rarity: 'common' },
            { name: 'Analytics', emoji: '📊', color: '#73BE28', rarity: 'common' },
            { name: 'Infrastructure', emoji: '⚙️', color: '#FFD23F', rarity: 'common' },
            { name: 'Monitoring', emoji: '🏠', color: '#00D4FF', rarity: 'common' }
        ];
        
        const dynatraceSymbol = { name: 'Dynatrace', emoji: 'DT', color: '#6C2C9C', rarity: 'legendary' };
        
        // Payout Matrix
        const payoutMatrix = {
            triple: {
                'Smartscape': { multiplier: 10, name: 'TOPOLOGY MASTERY!' },
                'Application': { multiplier: 10, name: 'APM BREAKTHROUGH!' },
                'Database': { multiplier: 10, name: 'DATA OBSERVABILITY CHAMPION!' },
                'Server': { multiplier: 10, name: 'INFRASTRUCTURE MASTERY!' },
                'Cloud': { multiplier: 10, name: 'CLOUD-NATIVE SUCCESS!' },
                'Security': { multiplier: 10, name: 'SECURITY OBSERVABILITY EXPERT!' },
                'Dynatrace': { multiplier: 50, name: 'DYNATRACE MEGA JACKPOT!' }
            },
            double: {
                'Smartscape': { multiplier: 5, name: 'Topology Discovery!' },
                'Application': { multiplier: 5, name: 'APM Insight!' },
                'Database': { multiplier: 5, name: 'Data Connection!' },
                'Server': { multiplier: 5, name: 'Infrastructure Pair!' },
                'Cloud': { multiplier: 5, name: 'Cloud Duo!' },
                'Security': { multiplier: 5, name: 'Security Alliance!' }
            }
        };
        
        // Cheat System
        let cheatState = {
            active: null,
            winRateBoost: 0,
            detectionRisk: 0
        };
        
        const cheatMethods = {
            reelSynchronization: { 
                name: 'Reel Sync Control', 
                winRateBoost: 45, 
                detectionRisk: 20,
                description: 'Synchronize reels for optimal symbol alignment'
            },
            symbolWeighting: { 
                name: 'Symbol Frequency Boost', 
                winRateBoost: 35, 
                detectionRisk: 15,
                description: 'Increase favorable symbol frequency'
            },
            jackpotTrigger: { 
                name: 'Jackpot Trigger', 
                winRateBoost: 60, 
                detectionRisk: 40,
                description: 'Force jackpot combinations'
            }
        };
        
        // Cheat Functions
        function toggleCheatSidePanel() {
            const panel = document.getElementById('cheatSidePanel');
            const isVisible = panel.style.transform === 'translateX(0px)';
            
            if (isVisible) {
                panel.style.transform = 'translateX(-100%)';
            } else {
                panel.style.transform = 'translateX(0px)';
            }
        }
        
        function activateCheat(cheatType) {
            if (cheatMethods[cheatType]) {
                cheatState.active = cheatType;
                cheatState.winRateBoost = cheatMethods[cheatType].winRateBoost;
                cheatState.detectionRisk = cheatMethods[cheatType].detectionRisk;
                
                // Update UI
                document.querySelectorAll('.cheat-button').forEach(btn => btn.classList.remove('active'));
                document.getElementById(`cheat${cheatType.charAt(0).toUpperCase() + cheatType.slice(1)}`).classList.add('active');
                document.getElementById('sidePanelCheatStatus').textContent = cheatMethods[cheatType].name;
                
                console.log(`🎯 Cheat activated: ${cheatMethods[cheatType].name} (+${cheatState.winRateBoost}% win rate, ${cheatState.detectionRisk}% risk)`);
            }
        }
        
        function deactivateCheat() {
            cheatState.active = null;
            cheatState.winRateBoost = 0;
            cheatState.detectionRisk = 0;
            
            // Update UI
            document.querySelectorAll('.cheat-button').forEach(btn => btn.classList.remove('active'));
            document.getElementById('sidePanelCheatStatus').textContent = 'None';
            
            console.log('❌ Cheat deactivated');
        }
        
        // Payout Info Modal Functions
        function openPayoutInfoModal() {
            // Remove any existing modal
            const existingModal = document.getElementById('payoutInfoModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Create the modal
            const modal = document.createElement('div');
            modal.id = 'payoutInfoModal';
            modal.className = 'fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4';
            
            modal.innerHTML = `
                <div class="bg-dt-dark rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-dt-cyan/30">
                    <!-- Header -->
                    <div class="sticky top-0 bg-dt-dark rounded-t-xl p-6 border-b border-dt-cyan/30 backdrop-blur-md">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-gradient-to-br from-dt-green to-dt-yellow rounded-full flex items-center justify-center">
                                    <span class="text-xl">📊</span>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold text-dt-cyan">💰 Slots Payout Matrix</h2>
                                    <p class="text-sm text-dt-light-gray">Complete winning combinations and payouts</p>
                                </div>
                            </div>
                            <button onclick="closePayoutInfoModal()" class="text-dt-light-gray hover:text-white transition-colors p-2 hover:bg-dt-gray/50 rounded-lg">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Triple Matches -->
                            <div class="bg-gradient-to-br from-dt-green/10 to-dt-green/5 rounded-lg p-4 border border-dt-green/30">
                                <h4 class="text-lg font-bold text-dt-green mb-3 flex items-center">
                                    <span class="w-6 h-6 bg-dt-green rounded-full flex items-center justify-center text-xs mr-2">🎊</span>
                                    TRIPLE MATCHES (10x)
                                </h4>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center py-2 px-3 bg-dt-dark/30 rounded-lg">
                                        <span class="flex items-center space-x-2">
                                            <span>🏢🏢🏢</span>
                                            <span class="text-sm">Smartscape Triple</span>
                                        </span>
                                        <span class="text-dt-yellow font-bold">10x bet</span>
                                    </div>
                                    <div class="flex justify-between items-center py-2 px-3 bg-dt-dark/30 rounded-lg">
                                        <span class="flex items-center space-x-2">
                                            <span>📱📱📱</span>
                                            <span class="text-sm">Application Triple</span>
                                        </span>
                                        <span class="text-dt-yellow font-bold">10x bet</span>
                                    </div>
                                    <div class="flex justify-between items-center py-2 px-3 bg-dt-dark/30 rounded-lg">
                                        <span class="flex items-center space-x-2">
                                            <span>🗄️🗄️🗄️</span>
                                            <span class="text-sm">Database Triple</span>
                                        </span>
                                        <span class="text-dt-yellow font-bold">10x bet</span>
                                    </div>
                                    <div class="flex justify-between items-center py-2 px-3 bg-dt-dark/30 rounded-lg">
                                        <span class="flex items-center space-x-2">
                                            <span>🖥️🖥️🖥️</span>
                                            <span class="text-sm">Server Triple</span>
                                        </span>
                                        <span class="text-dt-yellow font-bold">10x bet</span>
                                    </div>
                                    <div class="flex justify-between items-center py-2 px-3 bg-dt-dark/30 rounded-lg">
                                        <span class="flex items-center space-x-2">
                                            <span>☁️☁️☁️</span>
                                            <span class="text-sm">Cloud Triple</span>
                                        </span>
                                        <span class="text-dt-yellow font-bold">10x bet</span>
                                    </div>
                                    <div class="flex justify-between items-center py-2 px-3 bg-dt-dark/30 rounded-lg">
                                        <span class="flex items-center space-x-2">
                                            <span>🛡️🛡️🛡️</span>
                                            <span class="text-sm">Security Triple</span>
                                        </span>
                                        <span class="text-dt-yellow font-bold">10x bet</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Double Matches -->
                            <div class="bg-gradient-to-br from-dt-blue/10 to-dt-blue/5 rounded-lg p-4 border border-dt-blue/30">
                                <h4 class="text-lg font-bold text-dt-blue mb-3 flex items-center">
                                    <span class="w-6 h-6 bg-dt-blue rounded-full flex items-center justify-center text-xs mr-2">🎯</span>
                                    DOUBLE MATCHES (5x)
                                </h4>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center py-2 px-3 bg-dt-dark/30 rounded-lg">
                                        <span class="flex items-center space-x-2">
                                            <span>🏢🏢</span>
                                            <span class="text-sm">Smartscape Pair</span>
                                        </span>
                                        <span class="text-dt-yellow font-bold">5x bet</span>
                                    </div>
                                    <div class="flex justify-between items-center py-2 px-3 bg-dt-dark/30 rounded-lg">
                                        <span class="flex items-center space-x-2">
                                            <span>📱📱</span>
                                            <span class="text-sm">Application Pair</span>
                                        </span>
                                        <span class="text-dt-yellow font-bold">5x bet</span>
                                    </div>
                                    <div class="flex justify-between items-center py-2 px-3 bg-dt-dark/30 rounded-lg">
                                        <span class="flex items-center space-x-2">
                                            <span>🗄️🗄️</span>
                                            <span class="text-sm">Database Pair</span>
                                        </span>
                                        <span class="text-dt-yellow font-bold">5x bet</span>
                                    </div>
                                    <div class="flex justify-between items-center py-2 px-3 bg-dt-dark/30 rounded-lg">
                                        <span class="flex items-center space-x-2">
                                            <span>🖥️🖥️</span>
                                            <span class="text-sm">Server Pair</span>
                                        </span>
                                        <span class="text-dt-yellow font-bold">5x bet</span>
                                    </div>
                                    <div class="flex justify-between items-center py-2 px-3 bg-dt-dark/30 rounded-lg">
                                        <span class="flex items-center space-x-2">
                                            <span>☁️☁️</span>
                                            <span class="text-sm">Cloud Pair</span>
                                        </span>
                                        <span class="text-dt-yellow font-bold">5x bet</span>
                                    </div>
                                    <div class="flex justify-between items-center py-2 px-3 bg-dt-dark/30 rounded-lg">
                                        <span class="flex items-center space-x-2">
                                            <span>🛡️🛡️</span>
                                            <span class="text-sm">Security Pair</span>
                                        </span>
                                        <span class="text-dt-yellow font-bold">5x bet</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Special Jackpot -->
                        <div class="mt-6 bg-gradient-to-r from-dt-purple/20 to-dt-cyan/20 rounded-lg p-6 border border-dt-purple/50">
                            <h4 class="text-xl font-bold text-dt-purple text-center mb-3 flex items-center justify-center">
                                <span class="w-8 h-8 bg-dt-purple rounded-full flex items-center justify-center text-lg mr-3">💎</span>
                                MEGA JACKPOT
                            </h4>
                            <div class="text-center">
                                <div class="text-lg mb-2">
                                    <span class="text-dt-cyan font-semibold flex items-center justify-center space-x-1">
                                        <img src="/assets/slot-icons/dynatrace.png" alt="Dynatrace" class="inline-block w-6 h-6"/>
                                        <img src="/assets/slot-icons/dynatrace.png" alt="Dynatrace" class="inline-block w-6 h-6"/>
                                        <img src="/assets/slot-icons/dynatrace.png" alt="Dynatrace" class="inline-block w-6 h-6"/>
                                        <span class="ml-2">DYNATRACE MEGA JACKPOT</span>
                                    </span>
                                </div>
                                <div class="text-2xl">
                                    <span class="text-dt-yellow font-bold bg-dt-yellow/20 px-4 py-2 rounded-lg">50x BET!</span>
                                </div>
                                <div class="text-xs text-dt-light-gray mt-2">
                                    <span class="bg-dt-purple/20 px-2 py-1 rounded">Ultra Rare - 1% Chance</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tips Section -->
                        <div class="mt-6 bg-gradient-to-r from-dt-gray/20 to-dt-dark/20 rounded-lg p-4 border border-dt-light-gray/20">
                            <h4 class="text-lg font-bold text-dt-orange mb-3">💡 Pro Tips</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-dt-light-gray">
                                <div class="flex items-center space-x-2">
                                    <span class="text-dt-green">•</span>
                                    <span>Doubles only count first two symbols</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <span class="text-dt-purple">•</span>
                                    <span>Mega jackpot has only 1% chance</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <span class="text-dt-cyan">•</span>
                                    <span>Higher multipliers take priority</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <span class="text-dt-yellow">•</span>
                                    <span>Bet more to win more!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add click outside to close
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closePayoutInfoModal();
                }
            });
            
            // Entrance animation
            const modalContent = modal.querySelector('.bg-dt-dark');
            modalContent.style.transform = 'scale(0.9)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'all 0.3s ease-out';
                modalContent.style.transform = 'scale(1)';
                modalContent.style.opacity = '1';
            }, 10);
        }
        
        function closePayoutInfoModal() {
            const modal = document.getElementById('payoutInfoModal');
            if (modal) {
                const modalContent = modal.querySelector('.bg-dt-dark');
                modalContent.style.transition = 'all 0.2s ease-in';
                modalContent.style.transform = 'scale(0.9)';
                modalContent.style.opacity = '0';
                
                setTimeout(() => {
                    modal.remove();
                }, 200);
            }
        }
        
        // SPA Router
        class VegasRouter {
            constructor() {
                this.routes = {
                    '/': 'entrance',
                    '/lobby': 'lobby',
                    '/slots': 'slots',
                    '/blackjack': 'blackjack',
                    '/dice': 'dice'
                };
                this.currentRoute = '/';
                this.balance = parseInt(localStorage.getItem('vegasBalance') || '1000');
            }
            
            init() {
                window.addEventListener('hashchange', () => this.handleRoute());
                this.handleRoute();
                this.createMatrixRain();
            }
            
            handleRoute() {
                const hash = window.location.hash.slice(1) || '/';
                const template = this.routes[hash] || 'entrance';
                
                // Check lockout status before loading any template
                checkLockoutStatus();
                
                this.loadTemplate(template);
            }
            
            loadTemplate(templateName) {
                const container = document.getElementById('app-container');
                const template = document.getElementById(`${templateName}-template`);
                
                if (template) {
                    container.innerHTML = template.innerHTML;
                    container.classList.remove('active');
                    setTimeout(() => {
                        container.classList.add('active');
                        this.initializeTemplate(templateName);
                    }, 50);
                }
            }
            
            initializeTemplate(templateName) {
                switch(templateName) {
                    case 'entrance':
                        this.createMatrixRain();
                        break;
                    case 'lobby':
                        this.updateUserDisplay();
                        break;
                    case 'slots':
                        // Initialize balance from localStorage to ensure it displays
                        this.balance = parseInt(localStorage.getItem('vegasBalance') || '5600');
                        console.log('🎰 Slots initialized with balance:', this.balance, 'localStorage:', localStorage.getItem('vegasBalance'));
                        this.updateBalance('slotsBalance');
                        // Update username display
                        this.updateUsername('slotsUsername');
                        // Also ensure the initial symbols are visible
                        setTimeout(() => {
                            const reelSymbols = document.querySelectorAll('.reel-symbol');
                            reelSymbols.forEach(symbol => {
                                symbol.style.opacity = '1';
                                symbol.style.transform = 'translateY(0) scale(1)';
                            });
                        }, 100);
                        break;
                    case 'blackjack':
                        // Initialize blackjack game state with global balance
                        this.balance = parseInt(localStorage.getItem('vegasBalance') || '5600');
                        blackjackGame.balance = this.balance;
                        blackjackGame.gameState = 'betting'; // Ensure we're in betting state
                        blackjackGame.currentBet = 0; // Reset any existing bet
                        initializeDeck();
                        updateBlackjackUI();
                        updateGameStatus('Place your bet to start!', 'text-dt-green');
                        enableGameButtons(false);
                        document.getElementById('dealBtn').disabled = true;
                        // Update username and balance in top nav
                        this.updateUsername('blackjackUsername');
                        this.updateBalance('blackjackBalanceTop');
                        console.log('🎲 Blackjack initialized with state:', blackjackGame.gameState);
                        break;
                    case 'dice':
                        // Initialize dice game state with global balance
                        this.balance = parseInt(localStorage.getItem('vegasBalance') || '5600');
                        // Initialize dice game with slight delay to ensure DOM is ready
                        setTimeout(() => {
                            initializeDiceGame();
                            console.log('🎲 Dice game auto-initialized on template load');
                        }, 100);
                        console.log('🎲 Dice game loaded');
                        break;
                }
            }
            
            updateUserDisplay() {
                const username = localStorage.getItem('vegasUsername') || 'Player';
                const welcomeEl = document.getElementById('userWelcome');
                const balanceEl = document.getElementById('userBalance');
                
                if (welcomeEl) welcomeEl.textContent = `Welcome, ${username}!`;
                if (balanceEl) balanceEl.textContent = `Balance: $${this.balance}`;
            }
            
            updateBalance(elementId) {
                const balanceEl = document.getElementById(elementId);
                if (balanceEl) balanceEl.textContent = `Balance: $${this.balance}`;
            }
            
            updateUsername(elementId) {
                const username = localStorage.getItem('vegasUsername') || 'Player';
                const usernameEl = document.getElementById(elementId);
                if (usernameEl) usernameEl.textContent = `Welcome, ${username}!`;
            }
            
            createMatrixRain() {
                const container = document.getElementById('matrixRain');
                if (!container) return;
                
                container.innerHTML = '';
                const chars = '01アカサタナハマヤラワ';
                const columns = Math.floor(window.innerWidth / 20);
                
                for (let i = 0; i < columns; i++) {
                    const char = document.createElement('div');
                    char.className = 'matrix-char';
                    char.style.left = `${i * 20}px`;
                    char.style.animationDelay = `${Math.random() * 2}s`;
                    char.style.animationDuration = `${3 + Math.random() * 2}s`;
                    char.textContent = chars[Math.floor(Math.random() * chars.length)];
                    container.appendChild(char);
                }
            }
        }
        
        // ===== LOCKOUT SYSTEM =====
        
        // Socket.IO event listeners for lockout notifications
        socket.on('connect', () => {
            console.log('🔌 Connected to Vegas Casino server');
        });
        
        socket.on('user-lockout', (lockoutInfo) => {
            console.log('🚨 Received lockout notification:', lockoutInfo);
            
            // Check if this lockout is for the current user
            const currentUser = localStorage.getItem('vegasUsername') || 'Lawro';
            if (lockoutInfo.username === currentUser) {
                console.log(`🔒 Current user ${currentUser} has been locked out - INSTANT enforcement`);
                showRealLockoutScreen(lockoutInfo);
            }
        });

        socket.on('disconnect', () => {
            console.log('📡 Disconnected from Vegas Casino server');
        });

        // Add periodic lockout checking for real-time detection (every 10 seconds)
        setInterval(async () => {
            try {
                const currentUser = localStorage.getItem('vegasUsername') || 'Lawro';
                const response = await fetch(`/api/admin/lockout-status/${currentUser}`);
                const data = await response.json();
                
                if (data.locked && !window.isLockoutScreenShowing) {
                    console.log('🚨 Periodic check detected lockout - showing INSTANT screen');
                    showRealLockoutScreen(data);
                }
            } catch (error) {
                console.error('❌ Periodic lockout check failed:', error);
            }
        }, 10000);
            
            isUserLocked = true;
            lockoutData = lockoutInfo;
            
            // Switch to lockout template
            const appContainer = document.getElementById('app');
            const lockoutTemplate = document.getElementById('lockout-template');
            
            if (appContainer && lockoutTemplate) {
                console.log('✅ Found app container and lockout template');
                appContainer.innerHTML = lockoutTemplate.innerHTML;
                
                // Populate lockout data
                updateLockoutDisplay(lockoutInfo);
                
                // Create matrix rain effect for lockout screen
                createLockoutMatrixRain();
            } else {
                console.error('❌ Missing elements:', { 
                    appContainer: !!appContainer, 
                    lockoutTemplate: !!lockoutTemplate 
                });
                
                // Fallback: Create simple lockout screen
                if (appContainer) {
                    appContainer.innerHTML = `
                        <div class="min-h-screen flex items-center justify-center bg-red-900">
                            <div class="text-center text-white p-8">
                                <h1 class="text-4xl font-bold mb-4">🚨 ACCOUNT LOCKED 🚨</h1>
                                <p class="text-xl mb-4">User: ${lockoutInfo.username || 'Unknown'}</p>
                                <p class="text-lg mb-4">Reason: ${lockoutInfo.reason || 'Security violation'}</p>
                                <p class="text-sm">Contact administrator to unlock your account</p>
                            </div>
                        </div>
                    `;
                }
            }
        }
        
        // Update lockout display with data
        function updateLockoutDisplay(lockoutInfo) {
            const elements = {
                username: document.getElementById('lockoutUsername'),
                reason: document.getElementById('lockoutReason'),
                time: document.getElementById('lockoutTime'),
                violations: document.getElementById('lockoutViolations'),
                confiscated: document.getElementById('lockoutConfiscated'),
                balanceAdjustment: document.getElementById('lockoutBalanceAdjustment')
            };
            
            if (elements.username) elements.username.textContent = lockoutInfo.username || 'Unknown';
            if (elements.reason) elements.reason.textContent = lockoutInfo.reason || 'Security violation detected';
            if (elements.time) elements.time.textContent = new Date(lockoutInfo.timestamp).toLocaleString();
            
            // Handle cheat-specific data
            if (lockoutInfo.cheatData) {
                if (elements.violations) elements.violations.textContent = lockoutInfo.cheatData.violations || lockoutInfo.cheatData.totalViolations || 'Unknown';
                if (elements.confiscated) elements.confiscated.textContent = `$${lockoutInfo.cheatData.winningsConfiscated || lockoutInfo.cheatData.totalWinningsConfiscated || '0'}`;
                if (elements.balanceAdjustment) elements.balanceAdjustment.textContent = lockoutInfo.cheatData.balanceAdjustment || 'Unknown';
            } else {
                if (elements.violations) elements.violations.textContent = 'Unknown';
                if (elements.confiscated) elements.confiscated.textContent = '$0';
                if (elements.balanceAdjustment) elements.balanceAdjustment.textContent = 'Unknown';
            }
        }
        
        // Create matrix rain effect for lockout screen
        function createLockoutMatrixRain() {
            const matrixContainer = document.getElementById('lockoutMatrixRain');
            if (!matrixContainer) return;
            
            matrixContainer.innerHTML = ''; // Clear existing rain
            
            const characters = '01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ🚨💀⚠️🔒';
            
            for (let i = 0; i < 30; i++) {
                const column = document.createElement('div');
                column.style.position = 'absolute';
                column.style.top = '0';
                column.style.left = Math.random() * 100 + '%';
                column.style.color = '#ff4444';
                column.style.fontSize = '14px';
                column.style.fontFamily = 'monospace';
                column.style.lineHeight = '1.2';
                column.style.animation = `matrixFall ${(Math.random() * 10 + 10)}s linear infinite`;
                column.style.animationDelay = Math.random() * 20 + 's';
                
                let columnText = '';
                for (let j = 0; j < 20; j++) {
                    columnText += characters[Math.floor(Math.random() * characters.length)] + '<br>';
                }
                column.innerHTML = columnText;
                
                matrixContainer.appendChild(column);
            }
        }
        
        // Check lockout status on page load
        function checkLockoutStatus() {
            // Get the current user from multiple possible sources
            const currentUser = localStorage.getItem('vegasUsername') || 
                               (JSON.parse(localStorage.getItem('vegas.customerData') || '{}').customerName) ||
                               'Lawro'; // Default to Lawro for testing
            
            console.log('🔍 Checking lockout status for user:', currentUser);
            console.log('🔍 localStorage vegasUsername:', localStorage.getItem('vegasUsername'));
            console.log('🔍 localStorage vegas.customerData:', localStorage.getItem('vegas.customerData'));
            
            // Check server for lockout status
            fetch(`/api/admin/lockout-status/${currentUser}`)
                .then(response => {
                    console.log('🔍 Lockout API response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('🔍 Lockout status check result:', data);
                    if (data.locked) {
                        console.log('🚨 User is locked, showing lockout screen');
                        showLockoutScreen(data);
                        return;
                    }
                    console.log('✅ User is not locked, allowing access');
                })
                .catch(error => {
                    console.warn('⚠️ Failed to check lockout status:', error);
                    // Don't block access if we can't check lockout status
                });
        }
        
        // Force lockout check for current user (debugging)
        window.forceLockoutCheck = function() {
            console.log('🔧 Forcing lockout check...');
            checkLockoutStatus();
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
        
        // Global functions
        function navigateTo(route) {
            window.location.hash = route;
        }
        
        function enterCasino() {
            // Get form values
            const username = document.getElementById('usernameInput').value.trim();
            const email = document.getElementById('emailInput').value.trim();
            const companyName = document.getElementById('companyNameInput').value.trim();
            const personaSelect = document.getElementById('personaSelect').value;
            const customPersona = document.getElementById('customPersonaInput').value.trim();
            const booth = document.getElementById('boothSelect').value;
            const dataConsentRadio = document.querySelector('input[name="dataConsent"]:checked');
            
            // Basic validation
            if (!username) {
                alert('ERROR: CUSTOMER NAME REQUIRED');
                return;
            }
            
            if (username.length < 2) {
                alert('ERROR: CUSTOMER NAME TOO SHORT');
                return;
            }

            if (!email) {
                alert('ERROR: EMAIL ADDRESS REQUIRED');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('ERROR: INVALID EMAIL FORMAT');
                return;
            }

            if (!companyName) {
                alert('ERROR: COMPANY NAME REQUIRED');
                return;
            }

            // Data consent validation
            if (!dataConsentRadio) {
                alert('ERROR: DATA CAPTURE CONSENT SELECTION REQUIRED');
                return;
            }
            
            const dataConsent = dataConsentRadio.value === 'true';

            // Determine final persona value
            const finalPersona = personaSelect === 'Other' ? customPersona : personaSelect;
            if (personaSelect === 'Other' && !customPersona) {
                alert('ERROR: CUSTOM PERSONA REQUIRED');
                return;
            }
            
            // Store user data
            const userData = {
                name: username,
                email: email,
                companyName: companyName,
                persona: finalPersona,
                booth: booth,
                dataConsent: dataConsent,
                registeredAt: new Date().toISOString()
            };
            
            localStorage.setItem('vegasUserData', JSON.stringify(userData));
            localStorage.setItem('vegasUsername', username);
            
            // Navigate to lobby
            navigateTo('/lobby');
        }
        
        function toggleCustomPersona() {
            const personaSelect = document.getElementById('personaSelect');
            const customPersonaInput = document.getElementById('customPersonaInput');
            
            if (personaSelect && customPersonaInput) {
                if (personaSelect.value === 'Other') {
                    customPersonaInput.classList.remove('hidden');
                    customPersonaInput.focus();
                } else {
                    customPersonaInput.classList.add('hidden');
                    customPersonaInput.value = '';
                }
            }
        }
        
        function signOut() {
            // Clear user data
            localStorage.removeItem('vegasUserData');
            localStorage.removeItem('vegasUsername');
            localStorage.removeItem('vegasBalance');
            
            // Reset balance
            router.balance = 1000;
            
            // Navigate back to entrance
            navigateTo('/');
        }
        
        function addMoney() {
            // Add $500 to balance
            router.balance += 500;
            localStorage.setItem('vegasBalance', router.balance.toString());
            
            // Update balance display based on current game
            if (window.location.hash.includes('slots')) {
                router.updateBalance('slotsBalance');
            } else if (window.location.hash.includes('blackjack')) {
                // Update blackjack game balance and UI
                blackjackGame.balance = router.balance;
                updateBlackjackUI();
                router.updateBalance('blackjackBalanceTop');
            }
            
            // Show visual feedback
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '💰 Added!';
            button.style.background = 'linear-gradient(to right, #10B981, #34D399)';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 1000);
        }
        
        function spinSlots() {
            const betAmount = parseInt(document.getElementById('slotsBetAmount').value);
            
            // Sync balance from localStorage to ensure accuracy
            router.balance = parseInt(localStorage.getItem('vegasBalance') || '1000');
            console.log('🎰 Spin started with balance:', router.balance, 'Bet:', betAmount);
            
            if (router.balance < betAmount) {
                document.getElementById('slotsResult').textContent = 'Insufficient balance!';
                return;
            }
            
            // Disable spin button during spin
            const spinButton = document.getElementById('spinButton');
            spinButton.disabled = true;
            spinButton.textContent = '🎰 SPINNING...';
            
            // Clear previous results
            document.getElementById('slotsResult').textContent = '';
            document.getElementById('slotsWin').textContent = '';
            document.getElementById('cheatStatusDisplay').textContent = '';
            
            // Start reel animations - symbols moving down
            const reelSymbols = document.querySelectorAll('.reel-symbol');
            reelSymbols.forEach(symbol => {
                symbol.classList.add('spinning');
            });
            
            // Generate results after enhanced animation
            setTimeout(() => {
                const results = generateSlotResults();
                
                // Remove spinning animation and add drop-in effect
                reelSymbols.forEach(symbol => {
                    symbol.classList.remove('spinning');
                    symbol.classList.add('dropping');
                });
                
                // Update 3x3 grid display with new symbols dropping in
                for (let row = 1; row <= 3; row++) {
                    for (let col = 1; col <= 3; col++) {
                        const symbolIndex = (row - 1) * 3 + (col - 1);
                        const symbolElement = document.querySelector(`#symbol${row}-${col} div`);
                        if (symbolElement && results.grid[symbolIndex]) {
                            const symbol = results.grid[symbolIndex];
                            if (symbol.name === 'Dynatrace') {
                                // Special display for Dynatrace logo - using actual PNG image
                                symbolElement.innerHTML = '<img src="assets/slot-icons/dynatrace.png" alt="Dynatrace" style="width: 50px; height: 50px; object-fit: contain; filter: drop-shadow(0 0 10px rgba(108,44,156,0.8));">';
                            } else {
                                symbolElement.textContent = symbol.emoji;
                            }
                        }
                    }
                }
                
                // Remove drop-in animation after completion
                setTimeout(() => {
                    reelSymbols.forEach(symbol => {
                        symbol.classList.remove('dropping');
                    });
                }, 800);
                
                // Calculate and display results
                const winResult = calculateSlotWin(results.payline, betAmount);
                
                // Calculate new balance
                const originalBalance = router.balance;
                const newBalance = originalBalance - betAmount + winResult.winAmount;
                
                // Update balance
                router.balance = newBalance;
                localStorage.setItem('vegasBalance', newBalance.toString());
                
                console.log('🎰 Balance Calculation Debug:', {
                    originalBalance: originalBalance,
                    betAmount: betAmount,
                    winAmount: winResult.winAmount,
                    calculatedNewBalance: newBalance,
                    routerBalance: router.balance,
                    localStorageBalance: localStorage.getItem('vegasBalance')
                });
                
                // Display results
                if (winResult.winAmount > 0) {
                    document.getElementById('slotsResult').textContent = winResult.message;
                    document.getElementById('slotsWin').textContent = `🎉 WON: $${winResult.winAmount} 🎉`;
                } else {
                    document.getElementById('slotsResult').textContent = 'Try again!';
                    document.getElementById('slotsWin').textContent = '';
                }
                
                // Show cheat status if active
                if (cheatState.active) {
                    document.getElementById('cheatStatusDisplay').textContent = 
                        `⚠️ Cheat Active: ${cheatMethods[cheatState.active].name}`;
                }
                
                // Update balance display
                router.updateBalance('slotsBalance');
                
                // Re-enable spin button
                spinButton.disabled = false;
                spinButton.textContent = '🎰 SPIN REELS 🎰';
                
                // Send to server (simulate) - use the calculated newBalance
                sendSlotResult(results.payline, betAmount, winResult.winAmount, newBalance, originalBalance);
                
            }, 1500);
        }
        
        function generateSlotResults() {
            // Apply cheat logic if active
            if (cheatState.active && Math.random() * 100 < cheatState.winRateBoost) {
                return generateWinningCombination();
            }
            
            // Normal random results - generate 3x3 grid
            const grid = [];
            for (let i = 0; i < 9; i++) {
                const randomSymbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
                grid.push(randomSymbol);
            }
            
            // Extract payline (middle row: positions 3, 4, 5)
            const payline = [grid[3], grid[4], grid[5]];
            
            return { grid, payline };
        }
        
        function generateWinningCombination() {
            // Generate 3x3 grid with winning payline
            const grid = [];
            
            // Fill non-payline positions with random symbols
            for (let i = 0; i < 9; i++) {
                if (i === 3 || i === 4 || i === 5) {
                    // Payline positions - will be set below
                    grid.push(null);
                } else {
                    grid.push(slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
                }
            }
            
            // Generate winning payline
            const rand = Math.random();
            let payline;
            
            if (rand < 0.1) {
                // 10% chance for jackpot
                payline = [dynatraceSymbol, dynatraceSymbol, dynatraceSymbol];
            } else if (rand < 0.4) {
                // 30% chance for triple
                const symbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
                payline = [symbol, symbol, symbol];
            } else {
                // 60% chance for double
                const symbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
                const other = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
                payline = [symbol, symbol, other];
            }
            
            // Set payline positions in grid
            grid[3] = payline[0];
            grid[4] = payline[1];
            grid[5] = payline[2];
            
            return { grid, payline };
        }
        
        function calculateSlotWin(payline, betAmount) {
            // Check for Dynatrace Jackpot first
            if (payline[0].name === 'Dynatrace' && payline[1].name === 'Dynatrace' && payline[2].name === 'Dynatrace') {
                return {
                    winAmount: betAmount * 50,
                    message: '💎 DYNATRACE MEGA JACKPOT! 💎',
                    isWin: true
                };
            }
            
            // Check for triple matches
            if (payline[0].name === payline[1].name && payline[1].name === payline[2].name) {
                const payout = payoutMatrix.triple[payline[0].name];
                if (payout) {
                    return {
                        winAmount: betAmount * payout.multiplier,
                        message: `🎊 ${payout.name}`,
                        isWin: true
                    };
                }
            }
            
            // Check for double matches
            if (payline[0].name === payline[1].name || payline[1].name === payline[2].name || payline[0].name === payline[2].name) {
                const matchingSymbol = payline[0].name === payline[1].name ? payline[0] :
                                     payline[1].name === payline[2].name ? payline[1] : payline[0];
                const payout = payoutMatrix.double[matchingSymbol.name];
                if (payout) {
                    return {
                        winAmount: betAmount * payout.multiplier,
                        message: `🎯 ${payout.name}`,
                        isWin: true
                    };
                }
            }
            
            return { winAmount: 0, message: '', isWin: false };
        }
        
        function sendSlotResult(payline, betAmount, winAmount, newBalance, originalBalance) {
            // Send game result to server
            const userData = JSON.parse(localStorage.getItem('vegas.customerData') || '{}');
            
            console.log('🎰 SendSlotResult Debug:', {
                betAmount,
                winAmount, 
                newBalance,
                originalBalance,
                'calculation check': `${originalBalance} - ${betAmount} + ${winAmount} = ${originalBalance - betAmount + winAmount}`
            });
            
            const payload = {
                game: 'slots',
                action: 'spin',
                betAmount: betAmount,
                winAmount: winAmount,
                payline: payline.map(s => s.name),
                cheat: cheatState.active ? {
                    type: cheatState.active,
                    boost: cheatState.winRateBoost,
                    risk: cheatState.detectionRisk
                } : null,
                customerName: userData.customerName || localStorage.getItem('vegasUsername') || 'Anonymous',
                balance: originalBalance, // Original balance before bet
                newBalance: newBalance, // New balance after win/loss calculation
                // Add required fields for server logging
                Username: userData.customerName || localStorage.getItem('vegasUsername') || 'Anonymous',
                CustomerName: userData.customerName || localStorage.getItem('vegasUsername') || 'Anonymous',
                Email: userData.email || 'user@demo.com',
                CompanyName: userData.companyName || 'Demo Company',
                Persona: userData.persona || 'Demo User',
                Booth: userData.booth || 'UI Demo',
                OptIn: userData.optIn !== false,
                Balance: newBalance, // New balance after calculation
                BetAmount: betAmount,
                correlationId: 'ui_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                CheatActive: cheatState.active ? true : false,
                CheatType: cheatState.active || null,
                CheatDetails: cheatState.active ? {
                    winBoost: cheatState.winRateBoost / 100,
                    frequency: cheatState.detectionRisk / 100
                } : null
            };
            
            // Send to actual server API
            fetch('/api/slots/spin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Vegas-Casino-UI'
                },
                body: JSON.stringify(payload)
            }).then(response => response.json())
            .then(data => {
                console.log('🎰 Slots Result sent to server:', data);
            }).catch(error => {
                console.error('❌ Error sending slots result:', error);
                // Fallback log
                console.log('🎰 Slots Result (local):', payload);
            });
        }

        // ===== BLACKJACK CHEAT SYSTEM =====
        
        let blackjackCheatState = {
            active: null,
            winRateBoost: 0,
            detectionRisk: 0
        };
        
        const blackjackCheatMethods = {
            cardCounting: { 
                name: 'Card Counting', 
                winRateBoost: 40, 
                detectionRisk: 25,
                description: 'Track remaining high cards in deck'
            },
            dealerPeek: { 
                name: 'Dealer Hole Card', 
                winRateBoost: 50, 
                detectionRisk: 30,
                description: 'See dealer\'s hidden card'
            },
            luckyCards: { 
                name: 'Lucky Draw', 
                winRateBoost: 35, 
                detectionRisk: 20,
                description: 'Increase favorable card odds'
            }
        };
        
        function toggleBlackjackCheatSidePanel() {
            const panel = document.getElementById('blackjackCheatSidePanel');
            const btn = document.getElementById('blackjackCheatToggleBtn');
            
            if (panel.classList.contains('-translate-x-full')) {
                panel.classList.remove('-translate-x-full');
                btn.style.left = '320px';
            } else {
                panel.classList.add('-translate-x-full');
                btn.style.left = '1rem';
            }
        }
        
        function activateBlackjackCheat(cheatType) {
            const cheat = blackjackCheatMethods[cheatType];
            if (!cheat) return;
            
            // Implement specific cheat functionality
            if (cheatType === 'cardCounting') {
                activateCardCounting();
            } else if (cheatType === 'dealerPeek') {
                activateDealerPeek();
            } else if (cheatType === 'luckyCards') {
                activateLuckyDraw();
            }
            
            blackjackCheatState = {
                active: cheatType,
                winRateBoost: cheat.winRateBoost,
                detectionRisk: cheat.detectionRisk
            };
            
            // Update UI
            document.getElementById('blackjackSidePanelCheatStatus').textContent = cheat.name;
            document.getElementById('blackjackSidePanelCheatStatus').className = 'text-green-400';
            
            // Update button states
            document.querySelectorAll('#blackjackCheatSidePanel .cheat-button').forEach(btn => {
                btn.classList.remove('bg-green-600/60', 'border-green-400/70');
                btn.classList.add('bg-green-900/30', 'border-green-500/50');
            });
            
            const activeBtn = document.getElementById(`cheat${cheatType.charAt(0).toUpperCase() + cheatType.slice(1)}`);
            if (activeBtn) {
                activeBtn.classList.remove('bg-green-900/30', 'border-green-500/50');
                activeBtn.classList.add('bg-green-600/60', 'border-green-400/70');
            }
            
            logBlackjackAction('cheat-activated', { cheatType, winRateBoost: cheat.winRateBoost });
        }
        
        // Card Counting - Shows next 2 cards that will be dealt
        function activateCardCounting() {
            if (blackjackGame.deck.length >= 2) {
                const next1 = blackjackGame.deck[blackjackGame.deck.length - 1];
                const next2 = blackjackGame.deck[blackjackGame.deck.length - 2];
                
                // Create or update card counting preview
                let previewDiv = document.getElementById('cardCountingPreview');
                if (!previewDiv) {
                    previewDiv = document.createElement('div');
                    previewDiv.id = 'cardCountingPreview';
                    previewDiv.className = 'fixed top-20 right-4 bg-black/90 text-cyan-400 p-4 rounded-lg border-2 border-cyan-500 z-50 animate-pulse';
                    document.body.appendChild(previewDiv);
                }
                
                previewDiv.innerHTML = `
                    <div class="text-sm font-bold mb-3 text-center">🧮 CARD COUNT PREVIEW</div>
                    <div class="flex space-x-4">
                        <div class="text-center bg-cyan-900/50 p-2 rounded">
                            <div class="text-2xl font-bold">${next1.value}${next1.suit}</div>
                            <div class="text-xs">Next Card</div>
                        </div>
                        <div class="text-center bg-cyan-900/50 p-2 rounded">
                            <div class="text-2xl font-bold">${next2.value}${next2.suit}</div>
                            <div class="text-xs">After That</div>
                        </div>
                    </div>
                    <div class="text-xs text-cyan-300 mt-2 text-center">Cards coming from deck</div>
                `;
                
                console.log(`🧮 CARD COUNTING: Next cards are ${next1.value}${next1.suit} then ${next2.value}${next2.suit}`);
                
                // Remove after 8 seconds
                setTimeout(() => {
                    if (previewDiv) previewDiv.remove();
                }, 8000);
            }
        }
        
        // Dealer Peek - Shows dealer's hole card for 2 seconds
        function activateDealerPeek() {
            if (blackjackGame.gameState !== 'playing' || blackjackGame.dealerHand.length < 2) {
                updateGameStatusAnimated('❌ Dealer peek only works during play!', 'text-red-400');
                return;
            }
            
            const holeCard = blackjackGame.dealerHand[1];
            const dealerTotal = calculateHandValue(blackjackGame.dealerHand);
            
            // Create dealer peek display
            let peekDiv = document.getElementById('dealerPeekDisplay');
            if (!peekDiv) {
                peekDiv = document.createElement('div');
                peekDiv.id = 'dealerPeekDisplay';
                peekDiv.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-900/95 text-white p-8 rounded-xl border-3 border-red-400 z-50 text-center animate-pulse shadow-2xl';
                document.body.appendChild(peekDiv);
            }
            
            peekDiv.innerHTML = `
                <div class="text-2xl font-bold mb-4">👁️ DEALER'S HOLE CARD</div>
                <div class="text-6xl mb-4 font-bold text-red-300">${holeCard.value}${holeCard.suit}</div>
                <div class="text-xl mb-2">Dealer Total: <span class="text-yellow-400">${dealerTotal}</span></div>
                <div class="text-sm text-red-200">Disappearing in 2 seconds...</div>
                <div class="mt-4 bg-red-800/50 p-2 rounded text-xs">
                    🔍 CHEAT ACTIVATED
                </div>
            `;
            
            console.log(`👁️ DEALER PEEK: Hole card is ${holeCard.value}${holeCard.suit}, Total: ${dealerTotal}`);
            
            // Hide after 2 seconds
            setTimeout(() => {
                if (peekDiv) {
                    peekDiv.style.opacity = '0';
                    setTimeout(() => peekDiv.remove(), 300);
                }
            }, 2000);
        }
        
        // Lucky Draw - Increases odds of hitting 21
        function activateLuckyDraw() {
            // Visual feedback that lucky draw is now active
            let feedbackDiv = document.getElementById('luckyDrawFeedback');
            if (!feedbackDiv) {
                feedbackDiv = document.createElement('div');
                feedbackDiv.id = 'luckyDrawFeedback';
                feedbackDiv.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-900/90 text-green-300 px-6 py-3 rounded-lg border-2 border-green-500 z-50 animate-bounce';
                document.body.appendChild(feedbackDiv);
            }
            
            feedbackDiv.innerHTML = `
                <div class="text-center">
                    <div class="text-lg font-bold">🍀 LUCKY DRAW ACTIVATED!</div>
                    <div class="text-sm">Better odds of getting helpful cards</div>
                </div>
            `;
            
            console.log('🍀 LUCKY DRAW: Activated - increased odds of hitting 21');
            
            // Remove feedback after 3 seconds
            setTimeout(() => {
                if (feedbackDiv) {
                    feedbackDiv.style.opacity = '0';
                    setTimeout(() => feedbackDiv.remove(), 300);
                }
            }, 3000);
        }
        
        function deactivateBlackjackCheat() {
            blackjackCheatState = {
                active: null,
                winRateBoost: 0,
                detectionRisk: 0
            };
            
            document.getElementById('blackjackSidePanelCheatStatus').textContent = 'None';
            document.getElementById('blackjackSidePanelCheatStatus').className = 'text-dt-yellow';
            
            // Reset button states
            document.querySelectorAll('#blackjackCheatSidePanel .cheat-button').forEach(btn => {
                btn.classList.remove('bg-green-600/60', 'border-green-400/70');
                btn.classList.add('bg-green-900/30', 'border-green-500/50');
            });
            
            logBlackjackAction('cheat-deactivated', {});
        }
        
        function applyBlackjackCheatBonus(baseOutcome) {
            if (!blackjackCheatState.active) return baseOutcome;
            
            const cheat = blackjackCheatMethods[blackjackCheatState.active];
            const boostChance = cheat.winRateBoost / 100;
            
            // Apply cheat logic based on type
            switch(blackjackCheatState.active) {
                case 'cardCounting':
                    // Improve player's odds of getting good cards
                    if (Math.random() < boostChance) {
                        return 'cheat-boosted-win';
                    }
                    break;
                case 'dealerPeek':
                    // Show dealer's hole card (implemented in UI)
                    if (Math.random() < boostChance) {
                        return 'cheat-peek-advantage';
                    }
                    break;
                case 'luckyCards':
                    // Better card draws
                    if (Math.random() < boostChance) {
                        return 'cheat-lucky-draw';
                    }
                    break;
            }
            
            return baseOutcome;
        }
        
        // ===== END BLACKJACK CHEAT SYSTEM =====
        
        // ===== BLACKJACK GAME LOGIC =====
        
        // Blackjack Game State
        let blackjackGame = {
            deck: [],
            playerHand: [],
            dealerHand: [],
            playerTotal: 0,
            dealerTotal: 0,
            currentBet: 0,
            balance: 1000, // This will be synced with global balance
            gameState: 'betting', // betting, playing, dealer-turn, game-over
            wins: 0,
            // Cheat previews
            nextCardsPeek: [],
            dealerPeekActive: false
        };
        
        // Card suits and values for observability-themed blackjack
        const suits = ['♠️', '♥️', '♦️', '♣️'];
        const cardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const observabilityThemes = {
            'A': { name: 'APM', color: '#1496FF', icon: '📱' },
            '2': { name: 'Logs', color: '#73BE28', icon: '📝' },
            '3': { name: 'Metrics', color: '#FFD23F', icon: '📊' },
            '4': { name: 'Traces', color: '#FFA86B', icon: '🔗' },
            '5': { name: 'Cloud', color: '#00D4FF', icon: '☁️' },
            '6': { name: 'Server', color: '#6C2C9C', icon: '🖥️' },
            '7': { name: 'Database', color: '#73BE28', icon: '🗄️' },
            '8': { name: 'Security', color: '#FFA86B', icon: '🛡️' },
            '9': { name: 'Network', color: '#00D4FF', icon: '🌐' },
            '10': { name: 'Alerts', color: '#FF6B6B', icon: '🚨' },
            'J': { name: 'DevOps', color: '#FFD23F', icon: '⚙️' },
            'Q': { name: 'SRE', color: '#6C2C9C', icon: '👑' },
            'K': { name: 'Dynatrace', color: '#6C2C9C', icon: 'DT' }
        };
        
        function initializeDeck() {
            blackjackGame.deck = [];
            for (let suit of suits) {
                for (let value of cardValues) {
                    blackjackGame.deck.push({ value, suit, theme: observabilityThemes[value] });
                }
            }
            shuffleDeck();
        }
        
        function shuffleDeck() {
            for (let i = blackjackGame.deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [blackjackGame.deck[i], blackjackGame.deck[j]] = [blackjackGame.deck[j], blackjackGame.deck[i]];
            }
        }
        
        function drawCard() {
            if (blackjackGame.deck.length < 10) {
                initializeDeck(); // Reshuffle when deck is low
            }
            
            let card = blackjackGame.deck.pop();
            
            // Apply lucky draw cheat - increases odds of hitting 21
            if (blackjackCheatState.active === 'luckyCards' && blackjackGame.gameState === 'playing') {
                const playerTotal = blackjackGame.playerTotal;
                const needed = 21 - playerTotal;
                
                // 55% chance to get a helpful card when lucky draw is active
                if (Math.random() < 0.55 && needed > 0 && needed <= 11) {
                    const helpfulCards = blackjackGame.deck.filter(c => {
                        const cardValue = getCardValue(c, playerTotal);
                        return cardValue === needed || (needed > cardValue && cardValue > 0);
                    });
                    
                    if (helpfulCards.length > 0) {
                        const helpfulCard = helpfulCards[Math.floor(Math.random() * helpfulCards.length)];
                        const helpfulIndex = blackjackGame.deck.indexOf(helpfulCard);
                        if (helpfulIndex !== -1) {
                            blackjackGame.deck.splice(helpfulIndex, 1);
                            blackjackGame.deck.push(card); // Put original card back
                            card = helpfulCard;
                            logBlackjackAction('cheat-lucky-card', { originalCard: card, betterCard: helpfulCard });
                        }
                    }
                }
            }
            
            console.log('🃏 DEBUG - Drew card:', card.value + card.suit, 'Value:', getCardValue(card));
            return card;
        }
        
        function getCardValue(card) {
            if (['J', 'Q', 'K'].includes(card.value)) return 10;
            if (card.value === 'A') return 11; // Aces handled separately
            return parseInt(card.value);
        }
        
        function calculateHandValue(hand) {
            let value = 0;
            let aces = 0;
            
            for (let card of hand) {
                if (card.value === 'A') {
                    aces++;
                    value += 11;
                } else {
                    value += getCardValue(card);
                }
            }
            
            // Adjust for aces
            while (value > 21 && aces > 0) {
                value -= 10;
                aces--;
            }
            
            return value;
        }
        
        function placeBlackjackBet(amount) {
            console.log('🎲 DEBUG - placeBet called:', { 
                amount, 
                gameState: blackjackGame.gameState,
                currentBet: blackjackGame.currentBet,
                balance: blackjackGame.balance 
            });
            
            if (blackjackGame.gameState !== 'betting') {
                console.log('❌ Cannot bet - game state is:', blackjackGame.gameState);
                updateGameStatus(`Cannot bet while game state is: ${blackjackGame.gameState}`, 'text-red-500');
                return;
            }
            
            // Sync with global balance
            blackjackGame.balance = parseInt(localStorage.getItem('vegasBalance') || '5600');
            
            if (amount > blackjackGame.balance) {
                updateGameStatus('Insufficient balance!', 'text-red-500');
                return;
            }
            
            // Add to current bet (accumulate bets)
            blackjackGame.currentBet += amount;
            blackjackGame.balance -= amount;
            
            // Update global balance
            router.balance = blackjackGame.balance;
            localStorage.setItem('vegasBalance', router.balance.toString());
            
            updateBlackjackUI();
            router.updateBalance('blackjackBalanceTop'); // Update top nav balance
            updateGameStatus(`Total bet: $${blackjackGame.currentBet}. Deal cards to start!`, 'text-dt-green');
            
            // Enable deal button
            document.getElementById('dealBtn').disabled = false;
            
            console.log('✅ Bet placed successfully:', { 
                newBet: blackjackGame.currentBet,
                newBalance: blackjackGame.balance 
            });
        }
        
        function dealCards() {
            if (blackjackGame.currentBet === 0) return;
            
            // Send deal request to server
            sendBlackjackDeal();
            
            initializeDeck();
            blackjackGame.playerHand = [];
            blackjackGame.dealerHand = [];
            blackjackGame.gameState = 'playing';

            // Deal initial cards
            blackjackGame.playerHand.push(drawCard());
            blackjackGame.dealerHand.push(drawCard());
            blackjackGame.playerHand.push(drawCard());
            blackjackGame.dealerHand.push(drawCard()); // Hidden card

            // Calculate totals properly
            blackjackGame.playerTotal = calculateHandValue(blackjackGame.playerHand);
            blackjackGame.dealerTotal = calculateHandValue([blackjackGame.dealerHand[0]]); // Only first card for display

            // Update UI and render cards
            updateBlackjackUI();
            renderCards();

            console.log('🃏 DEBUG - Player hand:', blackjackGame.playerHand, 'Total:', blackjackGame.playerTotal);
            console.log('🃏 DEBUG - Dealer visible card:', blackjackGame.dealerHand[0], 'Visible total:', blackjackGame.dealerTotal);

            // Check for blackjack (natural 21 with 2 cards)
            if (blackjackGame.playerTotal === 21 && blackjackGame.playerHand.length === 2) {
                updateGameStatus('BLACKJACK! 🃏', 'text-dt-yellow');
                endGame('blackjack');
            } else {
                updateGameStatus('Your turn! Hit or Stand?', 'text-dt-cyan');
                enableGameButtons(true);
            }
            
            document.getElementById('dealBtn').disabled = true;
            
            // Log the game start
            logBlackjackAction('deal', { 
                bet: blackjackGame.currentBet, 
                playerTotal: blackjackGame.playerTotal,
                playerCards: blackjackGame.playerHand.map(c => c.value + c.suit),
                dealerCard: blackjackGame.dealerHand[0].value + blackjackGame.dealerHand[0].suit
            });
        }
        
        function hitCard() {
            if (blackjackGame.gameState !== 'playing') return;
            
            updateGameStatusAnimated('Drawing card...', 'text-dt-cyan');
            
            setTimeout(() => {
                const card = drawCard();
                blackjackGame.playerHand.push(card);
                blackjackGame.playerTotal = calculateHandValue(blackjackGame.playerHand);
                
                console.log('🃏 DEBUG - Hit card:', card.value + card.suit, 'New total:', blackjackGame.playerTotal);
                
                renderCards();
                updateBlackjackUI();
                
                setTimeout(() => {
                    if (blackjackGame.playerTotal > 21) {
                        updateGameStatusAnimated('💔 BUST! You went over 21! 💔', 'text-red-400 animate-pulse');
                        endGame('bust');
                    } else if (blackjackGame.playerTotal === 21) {
                        updateGameStatusAnimated('🌟 Perfect 21! Standing automatically 🌟', 'text-yellow-400 animate-pulse');
                        setTimeout(() => standPlayer(), 1500);
                    } else {
                        updateGameStatusAnimated(`You have ${blackjackGame.playerTotal}. Hit or Stand?`, 'text-dt-cyan');
                    }
                }, 800);
            }, 400);
            
            logBlackjackAction('hit', { 
                playerTotal: blackjackGame.playerTotal,
                cardDrawn: card.value + card.suit,
                handSize: blackjackGame.playerHand.length
            });
        }
        
        function standPlayer() {
            if (blackjackGame.gameState !== 'playing') return;
            
            blackjackGame.gameState = 'dealer-turn';
            enableGameButtons(false);
            
            // Reveal dealer's hidden card
            blackjackGame.dealerTotal = calculateHandValue(blackjackGame.dealerHand);
            
            // Show dealer peek cheat if active
            if (blackjackCheatState.active === 'dealerPeek') {
                updateGameStatus(`🕵️ CHEAT: Dealer has ${blackjackGame.dealerHand[1].value}${blackjackGame.dealerHand[1].suit} (Total: ${blackjackGame.dealerTotal})`, 'text-green-400');
                setTimeout(() => updateGameStatus('Dealer\'s turn...', 'text-dt-orange'), 2000);
            } else {
                updateGameStatus('Dealer\'s turn...', 'text-dt-orange');
            }
            
            // Dealer hits on 16 or less
            setTimeout(() => dealerPlay(), 1000);
            
            logBlackjackAction('stand', { playerTotal: blackjackGame.playerTotal, dealerTotal: blackjackGame.dealerTotal, cheatActive: blackjackCheatState.active });
        }
        
        function dealerPlay() {
            updateGameStatus('Revealing dealer\'s card...', 'text-dt-orange');
            
            // Animate dealer card reveal
            setTimeout(() => {
                renderCards(true); // Show dealer's hidden card
                updateBlackjackUI();
                
                setTimeout(() => {
                    // Continue dealer play
                    dealerDrawCards();
                }, 1000);
            }, 500);
        }
        
        function dealerDrawCards() {
            if (blackjackGame.dealerTotal < 17) {
                updateGameStatus(`Dealer has ${blackjackGame.dealerTotal}, drawing card...`, 'text-dt-orange');
                
                setTimeout(() => {
                    const card = drawCard();
                    blackjackGame.dealerHand.push(card);
                    blackjackGame.dealerTotal = calculateHandValue(blackjackGame.dealerHand);
                    
                    renderCards(true);
                    updateBlackjackUI();
                    
                    // Continue drawing if needed
                    setTimeout(() => dealerDrawCards(), 1200);
                }, 800);
            } else {
                // Dealer is done, determine winner
                setTimeout(() => {
                    if (blackjackGame.dealerTotal > 21) {
                        updateGameStatus('Dealer BUST! You win! 🎉', 'text-dt-green');
                        endGame('dealer-bust');
                    } else if (blackjackGame.dealerTotal > blackjackGame.playerTotal) {
                        updateGameStatus('Dealer wins 😞', 'text-red-500');
                        endGame('dealer-win');
                    } else if (blackjackGame.playerTotal > blackjackGame.dealerTotal) {
                        updateGameStatus('You win! 🎉', 'text-dt-green');
                        endGame('player-win');
                    } else {
                        updateGameStatus('Push! It\'s a tie 🤝', 'text-dt-yellow');
                        endGame('push');
                    }
                }, 1000);
            }
        }
        
        function endGame(result) {
            blackjackGame.gameState = 'game-over';
            enableGameButtons(false);
            
            let winAmount = 0;
            let resultMessage = '';
            let resultColor = '';
            
            switch (result) {
                case 'blackjack':
                    winAmount = Math.floor(blackjackGame.currentBet * 2.5);
                    blackjackGame.wins++;
                    resultMessage = `🎉 BLACKJACK! You win $${winAmount}! 🎉`;
                    resultColor = 'text-yellow-400';
                    break;
                case 'player-win':
                    winAmount = blackjackGame.currentBet * 2;
                    blackjackGame.wins++;
                    resultMessage = `🎊 YOU WIN! +$${winAmount} 🎊`;
                    resultColor = 'text-green-400';
                    break;
                case 'dealer-bust':
                    winAmount = blackjackGame.currentBet * 2;
                    blackjackGame.wins++;
                    resultMessage = `💥 DEALER BUST! You win $${winAmount}! 💥`;
                    resultColor = 'text-green-400';
                    break;
                case 'push':
                    winAmount = blackjackGame.currentBet;
                    resultMessage = `🤝 PUSH! Bet returned: $${winAmount} 🤝`;
                    resultColor = 'text-blue-400';
                    break;
                case 'bust':
                    winAmount = 0;
                    resultMessage = `💔 BUST! You lose $${blackjackGame.currentBet} 💔`;
                    resultColor = 'text-red-400';
                    break;
                default:
                    winAmount = 0;
                    resultMessage = `😞 DEALER WINS! You lose $${blackjackGame.currentBet} 😞`;
                    resultColor = 'text-red-400';
                    break;
            }
            
            blackjackGame.balance += winAmount;
            
            // Calculate amounts for server reporting
            const finalWinAmount = winAmount > blackjackGame.currentBet ? winAmount - blackjackGame.currentBet : 0;
            const lossAmount = winAmount === 0 ? blackjackGame.currentBet : 0;
            
            // Send result to server
            let serverResult = result;
            if (result === 'player-win' || result === 'dealer-bust') serverResult = 'win';
            if (result === 'bust' || result === 'dealer-win') serverResult = 'lose';
            sendBlackjackResult(serverResult, finalWinAmount, lossAmount);
            
            // Update global balance
            router.balance = blackjackGame.balance;
            localStorage.setItem('vegasBalance', router.balance.toString());
            
            // Show result with animation
            updateGameStatus(resultMessage, resultColor);
            
            // Add celebration effect for wins
            if (['blackjack', 'player-win', 'dealer-bust'].includes(result)) {
                const statusElement = document.getElementById('gameStatus');
                statusElement.style.animation = 'pulse 0.5s ease-in-out 3';
            }
            
            updateBlackjackUI();
            router.updateBalance('blackjackBalanceTop'); // Update top nav balance
            
            
            // Show results for 4 seconds, then reset
            setTimeout(() => {
                updateGameStatus('Preparing new hand...', 'text-dt-cyan');
                
                // Animate cards out
                const allCards = document.querySelectorAll('.card-element');
                allCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.transition = 'all 0.3s ease-in';
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px) scale(0.8)';
                    }, index * 50);
                });
                
                // Reset game state after cards animate out
                setTimeout(() => {
                    blackjackGame.gameState = 'betting';
                    blackjackGame.currentBet = 0;
                    blackjackGame.playerHand = [];
                    blackjackGame.dealerHand = [];
                    blackjackGame.playerTotal = 0;
                    blackjackGame.dealerTotal = 0;
                    
                    // Clear the table with smooth transition
                    document.getElementById('playerCards').innerHTML = `
                        <div class="casino-card-placeholder w-24 h-36 rounded-lg flex items-center justify-center animate-fadeInUp" style="background: linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%); border: 2px dashed rgba(0,255,255,0.3);">
                            <span class="text-cyan-600/50 text-xs font-bold">YOUR</span>
                        </div>
                        <div class="casino-card-placeholder w-24 h-36 rounded-lg flex items-center justify-center animate-fadeInUp" style="background: linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%); border: 2px dashed rgba(0,255,255,0.3);">
                            <span class="text-cyan-600/50 text-xs font-bold">CARDS</span>
                        </div>
                    `;
                    
                    document.getElementById('dealerCards').innerHTML = `
                        <div class="casino-card-placeholder w-24 h-36 rounded-lg flex items-center justify-center animate-fadeInUp" style="background: linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%); border: 2px dashed rgba(255,215,0,0.3);">
                            <span class="text-yellow-600/50 text-xs font-bold">DEALER</span>
                        </div>
                        <div class="casino-card-placeholder w-24 h-36 rounded-lg flex items-center justify-center animate-fadeInUp" style="background: linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%); border: 2px dashed rgba(255,215,0,0.3);">
                            <span class="text-yellow-600/50 text-xs font-bold">CARDS</span>
                        </div>
                    `;
                    
                    document.getElementById('dealBtn').disabled = true;
                    enableGameButtons(false);
                    updateBlackjackUI();
                    updateGameStatus('Place your bet to start a new hand!', 'text-dt-green');
                }, 800);
            }, 4000);
            
            logBlackjackAction('game-end', { result, winAmount, finalBalance: blackjackGame.balance });
        }
        
        function renderCards(showDealerHidden = false) {
            // Render player cards with staggered animation
            const playerCardsContainer = document.getElementById('playerCards');
            playerCardsContainer.innerHTML = '';
            
            blackjackGame.playerHand.forEach((card, index) => {
                const cardElement = createCardElement(card);
                cardElement.style.opacity = '0';
                cardElement.style.transform = 'translateY(-20px) scale(0.8)';
                cardElement.style.animationDelay = `${index * 0.3}s`;
                playerCardsContainer.appendChild(cardElement);
                
                // Animate card in
                setTimeout(() => {
                    cardElement.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    cardElement.style.opacity = '1';
                    cardElement.style.transform = 'translateY(0) scale(1)';
                }, index * 300 + 100);
            });
            
            // Render dealer cards with staggered animation
            const dealerCardsContainer = document.getElementById('dealerCards');
            dealerCardsContainer.innerHTML = '';
            
            blackjackGame.dealerHand.forEach((card, index) => {
                let cardElement;
                if (index === 1 && !showDealerHidden && blackjackGame.gameState === 'playing') {
                    // Hidden card
                    cardElement = createHiddenCard();
                } else {
                    cardElement = createCardElement(card);
                }
                
                cardElement.style.opacity = '0';
                cardElement.style.transform = 'translateY(-20px) scale(0.8)';
                cardElement.style.animationDelay = `${index * 0.3}s`;
                dealerCardsContainer.appendChild(cardElement);
                
                // Animate card in
                setTimeout(() => {
                    cardElement.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    cardElement.style.opacity = '1';
                    cardElement.style.transform = 'translateY(0) scale(1)';
                }, index * 300 + 50);
            });
        }
        
        function createCardElement(card) {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card-element w-24 h-36 rounded-lg border border-gray-800 flex flex-col items-center justify-between text-black font-bold transition-all duration-300 hover:scale-105 animate-fadeInUp shadow-lg';
            
            // Realistic card background
            cardDiv.style.background = 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 50%, #f1f3f4 100%)';
            cardDiv.style.border = '2px solid #333';
            cardDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)';
            
            // Determine card color
            const isRed = card.suit === '♥️' || card.suit === '♦️';
            const cardColor = isRed ? '#dc2626' : '#000000';
            
            cardDiv.innerHTML = `
                <div class="text-left text-xs font-bold p-1 self-start" style="color: ${cardColor}; line-height: 1;">
                    <div>${card.value}</div>
                    <div style="margin-top: -2px;">${card.suit}</div>
                </div>
                <div class="text-center flex-1 flex items-center justify-center">
                    <div class="text-2xl" style="color: ${cardColor};">${card.suit}</div>
                </div>
                <div class="text-right text-xs font-bold p-1 self-end transform rotate-180" style="color: ${cardColor}; line-height: 1;">
                    <div>${card.value}</div>
                    <div style="margin-top: -2px;">${card.suit}</div>
                </div>
            `;
            
            return cardDiv;
        }
        
        function createHiddenCard() {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card-element w-24 h-36 rounded-lg border border-gray-800 flex items-center justify-center animate-fadeInUp shadow-lg';
            cardDiv.style.background = 'linear-gradient(45deg, #1e40af 0%, #3b82f6 25%, #1e40af 50%, #3b82f6 75%, #1e40af 100%)';
            cardDiv.style.backgroundSize = '20px 20px';
            cardDiv.style.border = '2px solid #333';
            cardDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            cardDiv.innerHTML = `
                <div class="text-white text-lg font-bold">🃏</div>
            `;
            return cardDiv;
        }
        
        function updateBlackjackUI() {
            // Sync with global balance first
            blackjackGame.balance = parseInt(localStorage.getItem('vegasBalance') || '5600');
            
            console.log('🃏 DEBUG - Updating UI with totals:', {
                playerTotal: blackjackGame.playerTotal,
                dealerTotal: blackjackGame.dealerTotal,
                gameState: blackjackGame.gameState,
                playerHand: blackjackGame.playerHand
            });
            
            document.getElementById('blackjackBalance').textContent = `$${blackjackGame.balance}`;
            document.getElementById('blackjackBet').textContent = `$${blackjackGame.currentBet}`;
            document.getElementById('blackjackWins').textContent = blackjackGame.wins;
            document.getElementById('playerTotal').textContent = blackjackGame.playerTotal || '--';
            
            // Update top navigation balance as well
            const topBalanceEl = document.getElementById('blackjackBalanceTop');
            if (topBalanceEl) {
                topBalanceEl.textContent = `Balance: $${blackjackGame.balance}`;
            }
            
            // Only show dealer total if game is over or dealer is playing
            if (blackjackGame.gameState === 'dealer-turn' || blackjackGame.gameState === 'game-over') {
                document.getElementById('dealerTotal').textContent = blackjackGame.dealerTotal;
            } else {
                document.getElementById('dealerTotal').textContent = blackjackGame.gameState === 'playing' ? blackjackGame.dealerTotal : '--';
            }
        }
        
        function updateGameStatus(message, className = 'text-dt-green') {
            const statusElement = document.getElementById('gameStatus');
            if (statusElement) {
                statusElement.textContent = message;
                statusElement.className = `text-2xl font-bold ${className} min-h-[2rem] transition-all duration-300 drop-shadow-lg`;
            }
        }
        
        // Enhanced status update with animation
        function updateGameStatusAnimated(message, className = 'text-dt-green', showTime = 3000) {
            const statusElement = document.getElementById('gameStatus');
            if (statusElement) {
                // Fade out current message
                statusElement.style.opacity = '0.3';
                statusElement.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    statusElement.textContent = message;
                    statusElement.className = `text-2xl font-bold ${className} min-h-[2rem] transition-all duration-500 drop-shadow-lg`;
                    
                    // Fade in with scale effect
                    statusElement.style.opacity = '1';
                    statusElement.style.transform = 'scale(1)';
                    
                    // Add glow effect for special messages
                    if (className.includes('yellow') || className.includes('green') || className.includes('red')) {
                        statusElement.style.textShadow = '0 0 15px currentColor';
                        statusElement.style.animation = 'pulse 0.6s ease-in-out 2';
                        
                        setTimeout(() => {
                            statusElement.style.textShadow = '2px 2px 6px rgba(0,0,0,0.7)';
                            statusElement.style.animation = 'none';
                        }, showTime);
                    }
                }, 200);
            }
        }
        
        function enableGameButtons(enabled) {
            document.getElementById('hitBtn').disabled = !enabled;
            document.getElementById('standBtn').disabled = !enabled;
        }
        
        function logBlackjackAction(action, data) {
            const logEntry = `[${new Date().toLocaleTimeString()}] ${action.toUpperCase()}: ${JSON.stringify(data)}`;
            
            const logContainer = document.getElementById('blackjackLog');
            const logElement = document.createElement('div');
            logElement.className = 'text-xs text-dt-gray mb-1';
            logElement.textContent = logEntry;
            
            logContainer.appendChild(logElement);
            logContainer.scrollTop = logContainer.scrollHeight;
            
            // Send to server for logging
            sendBlackjackResult(action, data);
        }
        
        function sendBlackjackResult(action, data) {
            const user = JSON.parse(localStorage.getItem('vegasUser') || '{}');
            const timestamp = new Date().toISOString();
            
            const payload = {
                timestamp,
                game: 'blackjack',
                action,
                player: user.username || 'guest',
                email: user.email || 'guest@vegas.com',
                company: user.companyName || 'Vegas Casino',
                persona: user.persona || 'High Roller',
                booth: user.booth || 'VIP',
                balance: blackjackGame.balance,
                currentBet: blackjackGame.currentBet,
                ...data
            };
            
            fetch('/api/blackjack/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Vegas-Casino-UI'
                },
                body: JSON.stringify(payload)
            }).then(response => response.json())
            .then(data => {
                console.log('🃏 Blackjack action logged:', data);
            }).catch(error => {
                console.error('❌ Error logging blackjack action:', error);
            });
        }

        // Send blackjack deal request to server
        function sendBlackjackDeal() {
            const userData = JSON.parse(localStorage.getItem('vegas.customerData') || '{}');
            
            const payload = {
                Username: userData.customerName || localStorage.getItem('vegasUsername') || 'Anonymous',
                CustomerName: userData.customerName || localStorage.getItem('vegasUsername') || 'Anonymous',
                Email: userData.email || 'user@demo.com',
                CompanyName: userData.companyName || 'Demo Company',
                Persona: userData.persona || 'Demo User',
                Booth: userData.booth || 'UI Demo',
                OptIn: userData.optIn !== false,
                BetAmount: blackjackGame.currentBet,
                balance: blackjackGame.balance, // Send current balance
                Balance: blackjackGame.balance,
                Game: 'Vegas Blackjack',
                Action: 'Deal',
                GameState: 'Started',
                Device: 'Browser-UI',
                CheatActive: false,
                CheatType: null,
                CheatDetails: null,
                correlationId: 'ui_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            };

            console.log('🃏 Sending blackjack deal request:', payload);

            fetch('/api/blackjack/deal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Vegas-Casino-UI'
                },
                body: JSON.stringify(payload)
            }).then(response => response.json())
            .then(data => {
                console.log('🃏 Blackjack deal response:', data);
            }).catch(error => {
                console.error('❌ Error sending blackjack deal:', error);
            });
        }

        // Send blackjack result to server
        function sendBlackjackResult(result, winAmount = 0, lossAmount = 0) {
            const userData = JSON.parse(localStorage.getItem('vegas.customerData') || '{}');
            
            const payload = {
                Username: userData.customerName || localStorage.getItem('vegasUsername') || 'Anonymous',
                CustomerName: userData.customerName || localStorage.getItem('vegasUsername') || 'Anonymous',
                Email: userData.email || 'user@demo.com',
                CompanyName: userData.companyName || 'Demo Company',
                Persona: userData.persona || 'Demo User',
                Booth: userData.booth || 'UI Demo',
                OptIn: userData.optIn !== false,
                BetAmount: blackjackGame.currentBet,
                balance: blackjackGame.balance - winAmount + lossAmount, // Original balance before win/loss
                newBalance: blackjackGame.balance,
                Balance: blackjackGame.balance,
                Game: 'Vegas Blackjack',
                Action: 'GameResult',
                GameState: 'Completed',
                Result: result, // 'win', 'lose', 'push', 'blackjack'
                PlayerTotal: blackjackGame.playerTotal,
                DealerTotal: calculateHandValue(blackjackGame.dealerHand),
                WinAmount: winAmount,
                LossAmount: lossAmount,
                WinFlag: winAmount > 0 ? 1 : 0,
                LossFlag: lossAmount > 0 ? 1 : 0,
                BlackjackFlag: result === 'blackjack' ? 1 : 0,
                PushFlag: result === 'push' ? 1 : 0,
                Device: 'Browser-UI',
                CheatActive: false,
                CheatType: null,
                CheatDetails: null,
                correlationId: 'ui_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString()
            };

            console.log('🃏 Sending blackjack result:', payload);

            fetch('/api/blackjack/deal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Vegas-Casino-UI'
                },
                body: JSON.stringify(payload)
            }).then(response => response.json())
            .then(data => {
                console.log('🃏 Blackjack result response:', data);
            }).catch(error => {
                console.error('❌ Error sending blackjack result:', error);
            });
        }
        
        // Initialize blackjack when template loads
        document.addEventListener('DOMContentLoaded', () => {
            // Load blackjack state from localStorage if available
            const savedState = localStorage.getItem('blackjackGameState');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                blackjackGame.wins = parsed.wins || 0;
                // Don't load balance from saved state - use global balance instead
            }
            
            // Sync with global balance
            blackjackGame.balance = parseInt(localStorage.getItem('vegasBalance') || '5600');
            updateBlackjackUI();
        });
        
        // Save blackjack state periodically (but not balance - that's handled globally)
        setInterval(() => {
            localStorage.setItem('blackjackGameState', JSON.stringify({
                wins: blackjackGame.wins
                // Note: balance is handled by global vegasBalance in localStorage
            }));
        }, 5000);
        
        // ===== END BLACKJACK GAME LOGIC =====
        
        // ==================== DICE GAME FUNCTIONALITY ====================
        
        // Dice Game State
        let diceGame = {
            balance: parseInt(localStorage.getItem('vegasBalance') || '1000'),
            currentBet: 0,
            betType: null,
            payout: 0,
            dice1: 0,
            dice2: 0,
            total: 0,
            totalRolls: 0,
            totalWins: 0,
            totalWon: 0,
            isRolling: false
        };

        // Debug function to force enable roll button
        function forceEnableDiceButton() {
            const rollBtn = document.getElementById('rollDiceBtn');
            if (rollBtn) {
                rollBtn.disabled = false;
                rollBtn.style.opacity = '1';
                rollBtn.style.cursor = 'pointer';
                rollBtn.style.pointerEvents = 'auto';
                console.log('🔧 Force enabled dice roll button');
                return true;
            }
            console.log('❌ Roll button not found');
            return false;
        }

        // Debug function to check dice state
        function debugDiceState() {
            const rollBtn = document.getElementById('rollDiceBtn');
            console.log('🎲 DICE DEBUG STATE:', {
                currentBet: diceGame.currentBet,
                betType: diceGame.betType,
                isRolling: diceGame.isRolling,
                balance: diceGame.balance,
                buttonExists: !!rollBtn,
                buttonDisabled: rollBtn ? rollBtn.disabled : 'button not found',
                buttonStyle: rollBtn ? {
                    opacity: rollBtn.style.opacity,
                    pointerEvents: rollBtn.style.pointerEvents,
                    disabled: rollBtn.disabled
                } : 'N/A',
                shouldDisable: diceGame.currentBet === 0 || !diceGame.betType || diceGame.isRolling
            });
            return diceGame;
        }

        // Test function to simulate full betting process
        function testDiceBetting() {
            console.log('🧪 Testing dice betting process...');
            console.log('Step 1: Setting bet amount...');
            setDiceBet(25);
            setTimeout(() => {
                console.log('Step 2: Placing bet type...');
                placeDiceBet('pass', 2);
                setTimeout(() => {
                    console.log('Step 3: Checking final state...');
                    debugDiceState();
                }, 100);
            }, 100);
        }

        // Global dice initialization function
        function ensureDiceGameReady() {
            // Check if we're on the dice page and initialize if needed
            const currentPath = window.location.hash;
            if (currentPath.includes('dice') || currentPath.includes('#/dice')) {
                console.log('🎲 Ensuring dice game is ready...');
                
                // Wait for DOM elements to be available
                const checkAndInit = () => {
                    const rollBtn = document.getElementById('rollDiceBtn');
                    if (rollBtn) {
                        initializeDiceGame();
                        console.log('🎲 Dice game ensured ready');
                    } else {
                        setTimeout(checkAndInit, 250);
                    }
                };
                checkAndInit();
            }
        }

        // Add to global scope for console debugging
        // Force set bet for testing
        window.testDiceBetting = function() {
            console.log('🎯 Testing dice betting workflow...');
            console.log('Step 1: Setting bet amount to $25');
            setDiceBet(25);
            setTimeout(() => {
                console.log('Step 2: Setting bet type to PASS');
                placeDiceBet('pass', 2);
                setTimeout(() => {
                    debugDiceState();
                    console.log('🎲 Dice betting test complete - button should be enabled now');
                }, 200);
            }, 500);
        };
        
        // Force roll dice for testing
        window.forceRollDice = function() {
            console.log('🎲 FORCE ROLLING DICE...');
            if (diceGame.currentBet === 0) {
                setDiceBet(25);
            }
            if (!diceGame.betType) {
                placeDiceBet('pass', 2);
            }
            setTimeout(() => {
                console.log('🎲 Calling rollDice() directly...');
                rollDice();
            }, 100);
        };
        
        // Test complete workflow
        window.testCompleteWorkflow = function() {
            console.log('🎯 Testing COMPLETE dice workflow...');
            testDiceBetting();
            setTimeout(() => {
                console.log('🎲 Now attempting to roll...');
                const btn = document.getElementById('rollDiceBtn');
                if (btn && !btn.disabled) {
                    btn.click();
                } else {
                    console.log('❌ Button not ready, force rolling...');
                    forceRollDice();
                }
            }, 1000);
        };
        
        // Clear current bet (useful for resetting)
        window.clearDiceBet = function() {
            diceGame.currentBet = 0;
            diceGame.betType = null;
            document.querySelectorAll('.betting-chip').forEach(chip => {
                chip.classList.remove('selected', 'ring-4', 'ring-white');
            });
            document.querySelectorAll('.bet-button').forEach(btn => {
                btn.classList.remove('ring-4', 'ring-white');
            });
            updateDiceUI();
            updateDiceGameStatus('Bet cleared! Select your betting chips to start over.', 'text-dt-cyan');
            console.log('🎲 Dice bet cleared - start fresh!');
        };
        
        // Keyboard shortcut to roll dice (Press 'R' key)
        window.addEventListener('keydown', function(e) {
            if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                const btn = document.getElementById('rollDiceBtn');
                if (btn && !btn.disabled && diceGame.currentBet > 0 && diceGame.betType) {
                    console.log('🎲 Keyboard shortcut (R) pressed - rolling dice!');
                    rollDice();
                }
            }
        });
        
        // Complete dice state diagnostic
        window.fullDiceDiagnostic = function() {
            console.log('🔍 === FULL DICE GAME DIAGNOSTIC ===');
            console.log('1. Game Object:', diceGame);
            console.log('2. Button Element:', document.getElementById('rollDiceBtn'));
            console.log('3. Button Classes:', document.getElementById('rollDiceBtn')?.className);
            console.log('4. Button Disabled:', document.getElementById('rollDiceBtn')?.disabled);
            console.log('5. Button Style:', {
                opacity: document.getElementById('rollDiceBtn')?.style.opacity,
                cursor: document.getElementById('rollDiceBtn')?.style.cursor,
                pointerEvents: document.getElementById('rollDiceBtn')?.style.pointerEvents
            });
            console.log('6. Should Disable Logic:', diceGame.currentBet === 0 || !diceGame.betType || diceGame.isRolling);
            console.log('7. All Bet Buttons:', Array.from(document.querySelectorAll('.bet-button')).map(btn => ({
                id: btn.id,
                text: btn.textContent.substring(0, 30) + '...',
                onclick: btn.getAttribute('onclick')
            })));
            console.log('8. All Betting Chips:', Array.from(document.querySelectorAll('.betting-chip')).map(chip => ({
                text: chip.textContent.replace(/\s+/g, ' ').trim(),
                onclick: chip.getAttribute('onclick'),
                classes: chip.className
            })));
            debugDiceState();
        };
        
        window.forceEnableDiceButton = forceEnableDiceButton;
        window.debugDiceState = debugDiceState;
        window.testDiceBetting = testDiceBetting;
        window.ensureDiceGameReady = ensureDiceGameReady;
        window.diceGame = diceGame;
        
        // Dice Cheat Methods
        const diceCheatMethods = {
            luckyRolls: { 
                name: 'Lucky Rolls', 
                winRateBoost: 0.7, 
                detectionRisk: 0.3,
                description: 'Generally favorable dice outcomes'
            },
            loadedDice: { 
                name: 'Loaded Dice', 
                winRateBoost: 0.85, 
                detectionRisk: 0.7,
                description: 'Biases dice toward higher numbers'
            },
            doubleDown: { 
                name: 'Double Down', 
                winRateBoost: 0, 
                detectionRisk: 0.5,
                multiplier: 2,
                description: 'Doubles all winnings'
            }
        };
        
        let diceCheatState = {
            active: null,
            winRateBoost: 0,
            detectionRisk: 0
        };
        
        // Initialize Dice Game
        function initializeDiceGame() {
            // Sync balance from localStorage and router
            const storedBalance = parseInt(localStorage.getItem('vegasBalance') || '1000');
            diceGame.balance = router && router.balance ? router.balance : storedBalance;
            
            // Update balance display on initialization
            const diceBalanceEl = document.getElementById('diceBalance');
            if (diceBalanceEl) {
                diceBalanceEl.textContent = `Balance: $${diceGame.balance}`;
            }
            
            // Reset game state
            diceGame.currentBet = 0;
            diceGame.betType = null;
            diceGame.isRolling = false;
            
            // Setup roll button event handler
            const rollBtn = document.getElementById('rollDiceBtn');
            if (rollBtn) {
                // Remove any existing event listeners
                rollBtn.onclick = null;
                rollBtn.onmousedown = null;
                rollBtn.ontouchstart = null;
                
                // Universal click handler function
                const handleRollClick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Visual feedback for click
                    rollBtn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        rollBtn.style.transform = '';
                    }, 150);
                    
                    console.log('🎲 Roll button CLICKED!', {
                        disabled: rollBtn.disabled,
                        currentBet: diceGame.currentBet,
                        betType: diceGame.betType,
                        isRolling: diceGame.isRolling,
                        buttonStyle: {
                            opacity: rollBtn.style.opacity,
                            cursor: rollBtn.style.cursor,
                            pointerEvents: rollBtn.style.pointerEvents
                        }
                    });
                    
                    if (rollBtn.disabled) {
                        console.log('❌ Button is disabled, click ignored');
                        updateDiceGameStatus('Button disabled - check bet amount and type!', 'text-red-500');
                        return;
                    }
                    
                    console.log('✅ Button enabled, calling rollDice()...');
                    rollDice();
                };
                
                // Add multiple event handlers for better compatibility
                rollBtn.onclick = handleRollClick;
                rollBtn.onmousedown = handleRollClick;
                rollBtn.addEventListener('touchstart', handleRollClick, {passive: false});
                
                console.log('🎲 Roll button click handler set');
            }
            
            updateDiceUI();
            updateDiceGameStatus('Step 1: Select a betting chip ($25, $50, $100, $250) to set your bet amount!', 'text-dt-cyan');
            
            // Skip updating non-existent navigation elements
            // These don't exist in the current dice game layout:
            // - diceUsernameTop, diceBalanceTop
            
            console.log('🎲 Dice game initialized with balance:', diceGame.balance);
        }
        
        // Toggle Dice Cheat Panel
        function toggleDiceCheatPanel() {
            const panel = document.getElementById('diceCheatSidePanel');
            const isOpen = panel.style.transform === 'translateX(0px)';
            
            if (isOpen) {
                panel.style.transform = 'translateX(-100%)';
            } else {
                panel.style.transform = 'translateX(0px)';
            }
        }
        
        // Activate Dice Cheat
        function activateDiceCheat(cheatType) {
            const cheat = diceCheatMethods[cheatType];
            if (!cheat) return;
            
            // Apply specific cheat effects
            switch(cheatType) {
                case 'luckyRolls':
                    activateLuckyRolls();
                    break;
                case 'loadedDice':
                    activateLoadedDice();
                    break;
                case 'doubleDown':
                    activateDoubleDown();
                    break;
            }
            
            diceCheatState = {
                active: cheatType,
                winRateBoost: cheat.winRateBoost,
                detectionRisk: cheat.detectionRisk
            };
            
            // Update UI
            document.getElementById('diceCheatStatus').textContent = cheat.name;
            document.getElementById('diceCheatStatus').className = 'text-green-400';
            
            // Update risk meter
            const riskMeter = document.getElementById('diceRiskMeter');
            riskMeter.style.width = `${cheat.detectionRisk * 100}%`;
            
            // Update button states
            document.querySelectorAll('#diceCheatSidePanel .cheat-button').forEach(btn => {
                btn.classList.remove('bg-green-600/60', 'border-green-400/70');
                btn.classList.add('bg-green-900/30', 'border-green-500/50');
            });
            
            const activeBtn = document.getElementById(`cheat${cheatType.charAt(0).toUpperCase() + cheatType.slice(1)}`);
            if (activeBtn) {
                activeBtn.classList.remove('bg-green-900/30', 'border-green-500/50');
                activeBtn.classList.add('bg-green-600/60', 'border-green-400/70');
            }
            
            console.log(`🎯 Dice cheat activated: ${cheat.name}`);
        }
        
        // Lucky Rolls Cheat - Better outcomes
        function activateLuckyRolls() {
            updateDiceGameStatus('🍀 Network optimization activated - Enhanced metric patterns!', 'text-green-400');
            setTimeout(() => {
                updateDiceGameStatus('Configure your prediction parameters and analyze!', 'text-dt-cyan');
            }, 2000);
        }
        
        // Loaded Dice Cheat - Higher numbers
        function activateLoadedDice() {
            updateDiceGameStatus('⚖️ Performance boost enabled - Elevated metrics!', 'text-yellow-400');
            setTimeout(() => {
                updateDiceGameStatus('Configure your prediction parameters and analyze!', 'text-dt-cyan');
            }, 2000);
        }
        
        // Double Down Cheat - Double winnings
        function activateDoubleDown() {
            updateDiceGameStatus('🎯 Resource multiplier active - 2x returns!', 'text-purple-400');
            setTimeout(() => {
                updateDiceGameStatus('Configure your prediction parameters and analyze!', 'text-dt-cyan');
            }, 2000);
        }
        
        // Add bet amount to current bet
        function addDiceBet(amount) {
            if (diceGame.isRolling) return;
            
            diceGame.balance = parseInt(localStorage.getItem('vegasBalance') || '5600');
            
            if (diceGame.balance >= amount) {
                diceGame.currentBet += amount;
                updateDiceUI();
                updateDiceGameStatus(`Current bet: $${diceGame.currentBet}. Choose bet type!`, 'text-dt-yellow');
            } else {
                updateDiceGameStatus('Insufficient balance!', 'text-red-500');
            }
        }
        
        // Clear current bet
        function clearDiceBet() {
            if (diceGame.isRolling) return;
            
            diceGame.currentBet = 0;
            diceGame.betType = null;
            diceGame.payout = 0;
            updateDiceUI();
            updateDiceGameStatus('Configure your prediction parameters and analyze!', 'text-dt-cyan');
            
            // Clear bet button highlights
            document.querySelectorAll('.bet-button').forEach(btn => {
                btn.classList.remove('ring-4', 'ring-white');
            });
        }
        
        // Set dice bet amount (for betting chips)
        function setDiceBet(amount) {
            if (diceGame.isRolling) return;
            
            console.log('🎲 DEBUG - setDiceBet called:', { 
                amount, 
                currentBet: diceGame.currentBet, 
                balance: diceGame.balance,
                betType: diceGame.betType 
            });
            
            diceGame.balance = parseInt(localStorage.getItem('vegasBalance') || '5600');
            
            if (diceGame.balance >= (diceGame.currentBet + amount)) {
                diceGame.currentBet += amount;  // Add to existing bet instead of replacing
                
                // Update chip selection visual - find all chips and highlight multiple if needed
                document.querySelectorAll('.betting-chip').forEach(chip => {
                    // Don't remove selection, keep accumulating visual feedback
                    const chipAmount = chip.textContent.includes(`$${amount}`);
                    if (chipAmount) {
                        chip.classList.add('selected', 'ring-4', 'ring-white');
                        // Add a temporary glow effect for the clicked chip
                        chip.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.8)';
                        setTimeout(() => {
                            chip.style.boxShadow = '';
                        }, 300);
                    }
                });
                
                updateDiceUI();
                updateDiceGameStatus(`💰 Bet: $${diceGame.currentBet} | Step 2: Choose bet type (Pass, Don't Pass, Field, etc.)`, 'text-dt-yellow');
                
                console.log('✅ Bet amount added:', { 
                    addedAmount: amount,
                    totalBet: diceGame.currentBet, 
                    stillNeedBetType: !diceGame.betType 
                });
            } else {
                updateDiceGameStatus('Insufficient balance for this bet!', 'text-red-500');
            }
        }
        
        // Place a specific bet type
        function placeDiceBet(betType, payoutRatio) {
            console.log('🎯 DEBUG - placeDiceBet called:', { 
                betType, 
                payoutRatio,
                currentBet: diceGame.currentBet,
                hasAmount: diceGame.currentBet > 0 
            });
            
            if (diceGame.currentBet === 0) {
                updateDiceGameStatus('Place a bet first!', 'text-red-500');
                console.log('❌ Cannot place bet type - no amount set');
                return;
            }
            
            diceGame.betType = betType;
            diceGame.payout = payoutRatio;
            
            // Highlight selected bet
            document.querySelectorAll('.bet-button').forEach(btn => {
                btn.classList.remove('ring-4', 'ring-white');
            });
            
            // Fix button ID mapping for different bet types
            let buttonId = '';
            switch(betType) {
                case 'pass': buttonId = 'betPass'; break;
                case 'dont_pass': buttonId = 'betDontPass'; break;
                case 'field': buttonId = 'betField'; break;
                case 'high': buttonId = 'betHigh'; break;
                case 'low': buttonId = 'betLow'; break;
                case 'snake_eyes': buttonId = 'betSnakeEyes'; break;
                case 'boxcars': buttonId = 'betBoxcars'; break;
                case 'seven_out': buttonId = 'betSevenOut'; break;
                case 'doubles': buttonId = 'betDoubles'; break;
                default: buttonId = `bet${betType.charAt(0).toUpperCase() + betType.slice(1)}`;
            }
            
            const betButton = document.getElementById(buttonId);
            if (betButton) {
                betButton.classList.add('ring-4', 'ring-white');
                console.log(`✅ Highlighted button: ${buttonId}`);
            } else {
                console.warn(`⚠️ Button not found for betType: ${betType}, tried ID: ${buttonId}`);
            }
            
            updateDiceUI();
            updateDiceGameStatus(`✅ Ready to roll! $${diceGame.currentBet} on ${betType.toUpperCase()}. Click Roll Dice!`, 'text-dt-green');
            
            console.log('✅ Bet type set - Roll button should be enabled:', { 
                currentBet: diceGame.currentBet,
                betType: diceGame.betType,
                rollButtonDisabled: document.getElementById('rollDiceBtn').disabled
            });
        }
        
        // Roll the dice
        function rollDice() {
            console.log('🎲 rollDice() function called!', {
                currentBet: diceGame.currentBet,
                betType: diceGame.betType,
                isRolling: diceGame.isRolling,
                shouldReturn: diceGame.currentBet === 0 || !diceGame.betType || diceGame.isRolling
            });
            
            if (diceGame.currentBet === 0 || !diceGame.betType || diceGame.isRolling) {
                console.log('❌ rollDice() early return - conditions not met');
                return;
            }
            
            console.log('✅ rollDice() proceeding with dice roll...');
            diceGame.isRolling = true;
            document.getElementById('rollDiceBtn').disabled = true;
            
            // Store the original balance BEFORE deduction for server call
            diceGame.originalBalance = diceGame.balance;
            
            // Deduct bet from balance immediately for UI
            diceGame.balance -= diceGame.currentBet;
            
            // Update balance display immediately
            const diceBalanceEl = document.getElementById('diceBalance');
            if (diceBalanceEl) {
                diceBalanceEl.textContent = `Balance: $${diceGame.balance}`;
            }
            
            // Store updated balance
            router.balance = diceGame.balance;
            localStorage.setItem('vegasBalance', router.balance.toString());
            
            updateDiceUI();
            
            console.log('💰 Bet deducted, balance now:', diceGame.balance);
            updateDiceGameStatus('🎲 Rolling dice...', 'text-dt-yellow');
            
            // NOTE: Removed duplicate sendDiceRoll() call - only send final result
            
            // Animate dice rolling
            const dice1Element = document.getElementById('dice1');
            const dice2Element = document.getElementById('dice2');
            
            // Get the inner text elements (the actual dice display)
            const dice1Text = dice1Element ? dice1Element.querySelector('div') : null;
            const dice2Text = dice2Element ? dice2Element.querySelector('div') : null;
            
            console.log('🎭 Starting dice animation...', {
                dice1Element: !!dice1Element,
                dice2Element: !!dice2Element,
                dice1Text: !!dice1Text,
                dice2Text: !!dice2Text
            });
            
            if (dice1Element) dice1Element.classList.add('animate-spin');
            if (dice2Element) dice2Element.classList.add('animate-spin');
            
            let rollCount = 0;
            const rollInterval = setInterval(() => {
                if (dice1Text) dice1Text.textContent = Math.floor(Math.random() * 6) + 1;
                if (dice2Text) dice2Text.textContent = Math.floor(Math.random() * 6) + 1;
                rollCount++;
                
                if (rollCount > 10) {
                    clearInterval(rollInterval);
                    console.log('🎯 Animation complete, finalizing roll...');
                    finalizeDiceRoll();
                }
            }, 100);
        }
        
        // Finalize dice roll with cheat effects
        function finalizeDiceRoll() {
            // Generate base roll
            let dice1 = Math.floor(Math.random() * 6) + 1;
            let dice2 = Math.floor(Math.random() * 6) + 1;
            
            // Apply cheat effects
            if (diceCheatState.active === 'loadedDice') {
                // Bias toward higher numbers
                if (Math.random() < 0.85) {
                    dice1 = Math.max(dice1, Math.floor(Math.random() * 3) + 4); // 4-6
                    dice2 = Math.max(dice2, Math.floor(Math.random() * 3) + 4); // 4-6
                }
            }
            
            if (diceCheatState.active === 'luckyRolls') {
                // General luck boost - increase chances of getting favorable numbers
                if (Math.random() < 0.7) {
                    // Favor more common winning combinations
                    const luckyOutcomes = [
                        [3, 4], [4, 3], [2, 5], [5, 2], [1, 6], [6, 1], // Total 7 (most common)
                        [4, 4], [3, 3], [5, 5], [2, 2], [6, 6], [1, 1], // Doubles
                        [4, 5], [5, 4], [3, 6], [6, 3], [2, 6], [6, 2]  // Other good combinations
                    ];
                    const luckyRoll = luckyOutcomes[Math.floor(Math.random() * luckyOutcomes.length)];
                    dice1 = luckyRoll[0];
                    dice2 = luckyRoll[1];
                }
            }
            
            diceGame.dice1 = dice1;
            diceGame.dice2 = dice2;
            diceGame.total = dice1 + dice2;
            diceGame.totalRolls++;
            
            // Display final result
            const dice1El = document.getElementById('dice1');
            const dice2El = document.getElementById('dice2');
            const dice1Text = dice1El ? dice1El.querySelector('div') : null;
            const dice2Text = dice2El ? dice2El.querySelector('div') : null;
            const totalEl = document.getElementById('diceTotal');
            
            if (dice1Text) dice1Text.textContent = dice1;
            if (dice2Text) dice2Text.textContent = dice2;
            if (totalEl) totalEl.textContent = diceGame.total;
            
            console.log('🎲 Final dice result displayed:', { dice1, dice2, total: diceGame.total });
            
            // Remove spinning animation
            if (dice1El) dice1El.classList.remove('animate-spin');
            if (dice2El) dice2El.classList.remove('animate-spin');
            
            // Check for win
            setTimeout(() => {
                checkDiceResult();
            }, 1000);
        }
        
        // Check if bet won
        function checkDiceWin(betType, total, dice1, dice2) {
            switch(betType) {
                // Range bets
                case 'high': return total >= 8 && total <= 12;
                case 'low': return total >= 2 && total <= 6;
                case 'odd': return total % 2 === 1;
                case 'even': return total % 2 === 0;
                
                // Specific sum bets
                case 'sum2': return total === 2;
                case 'sum3': return total === 3;
                case 'sum4': return total === 4;
                case 'sum5': return total === 5;
                case 'sum6': return total === 6;
                case 'sum7': case 'seven': return total === 7;
                case 'sum8': return total === 8;
                case 'sum9': return total === 9;
                case 'sum10': return total === 10;
                case 'sum11': return total === 11;
                case 'sum12': return total === 12;
                
                // Doubles bets
                case 'doubles': return dice1 === dice2;
                case 'double1': return dice1 === 1 && dice2 === 1;
                case 'double2': return dice1 === 2 && dice2 === 2;
                case 'double3': return dice1 === 3 && dice2 === 3;
                case 'double4': return dice1 === 4 && dice2 === 4;
                case 'double5': return dice1 === 5 && dice2 === 5;
                case 'double6': return dice1 === 6 && dice2 === 6;
                
                // Field bet (2,3,4,9,10,11,12)
                case 'field': return [2,3,4,9,10,11,12].includes(total);
                
                default: return false;
            }
        }
        
        // Check dice result and handle winnings
        function checkDiceResult() {
            const won = checkDiceWin(diceGame.betType, diceGame.total, diceGame.dice1, diceGame.dice2);
            
            if (won) {
                let winAmount = diceGame.currentBet * diceGame.payout;
                
                // Apply double down cheat
                if (diceCheatState.active === 'doubleDown') {
                    winAmount *= 2;
                }
                
                diceGame.balance += winAmount;
                diceGame.totalWins++;
                diceGame.totalWon += winAmount;
                
                // Send win result to server
                const netWinAmount = winAmount - diceGame.currentBet; // Net win (excluding returned bet)
                sendDiceResult('win', diceGame.dice1, diceGame.dice2, diceGame.total, netWinAmount, 0);
                
                updateDiceGameStatus(`🎉 YOU WIN! +$${winAmount} 🎉`, 'text-dt-green');
            } else {
                // Send loss result to server
                sendDiceResult('lose', diceGame.dice1, diceGame.dice2, diceGame.total, 0, diceGame.currentBet);
                
                updateDiceGameStatus(`💔 You lose $${diceGame.currentBet} 💔`, 'text-red-500');
            }
            
            // Update global balance and display
            router.balance = diceGame.balance;
            localStorage.setItem('vegasBalance', router.balance.toString());
            
            // Update the actual dice balance display
            const diceBalanceEl = document.getElementById('diceBalance');
            if (diceBalanceEl) {
                diceBalanceEl.textContent = `Balance: $${diceGame.balance}`;
            }
            
            console.log('💰 Balance updated:', {
                newBalance: diceGame.balance,
                stored: localStorage.getItem('vegasBalance')
            });
            
            // CRITICAL: Reset rolling state BEFORE updating UI to enable button
            diceGame.isRolling = false;
            
            updateDiceUI();
            
            // Reset for next round
            setTimeout(() => {
                resetDiceRound();
            }, 3000);
        }
        
        // Reset for next round
        function resetDiceRound() {
            diceGame.currentBet = 0;
            diceGame.betType = null;
            diceGame.payout = 0;
            diceGame.isRolling = false;
            
            const dice1El = document.getElementById('dice1');
            const dice2El = document.getElementById('dice2');
            const dice1Text = dice1El ? dice1El.querySelector('div') : null;
            const dice2Text = dice2El ? dice2El.querySelector('div') : null;
            const totalEl = document.getElementById('diceTotal');
            
            if (dice1Text) dice1Text.textContent = '?';
            if (dice2Text) dice2Text.textContent = '?';
            if (totalEl) totalEl.textContent = '-';
            
            document.querySelectorAll('.bet-button').forEach(btn => {
                btn.classList.remove('ring-4', 'ring-white');
            });
            
            updateDiceUI();
            updateDiceGameStatus('Choose your bet and roll the dice!', 'text-dt-cyan');
        }
        
        // Update dice game UI
        function updateDiceUI() {
            // Update elements that actually exist in the HTML
            const currentBetEl = document.getElementById('currentDiceBet');
            const currentBetTypeEl = document.getElementById('currentBetType');
            
            if (currentBetEl) currentBetEl.textContent = diceGame.currentBet;
            if (currentBetTypeEl) currentBetTypeEl.textContent = diceGame.betType || 'None';
            
            // Skip elements that don't exist in this HTML layout:
            // - currentPayout, totalRolls, totalWins, winRate, totalWon
            
            // Update roll button
            const rollBtn = document.getElementById('rollDiceBtn');
            if (!rollBtn) {
                console.error('❌ Roll dice button not found!');
                return;
            }
            
            const shouldDisable = diceGame.currentBet === 0 || !diceGame.betType || diceGame.isRolling;
            
            // Update button state with visual feedback
            rollBtn.disabled = shouldDisable;
            
            if (shouldDisable) {
                rollBtn.style.opacity = '0.5';
                rollBtn.style.cursor = 'not-allowed';
                rollBtn.style.pointerEvents = 'none';
            } else {
                rollBtn.style.opacity = '1';
                rollBtn.style.cursor = 'pointer';
                rollBtn.style.pointerEvents = 'auto';
                rollBtn.style.backgroundColor = ''; // Clear any override
                rollBtn.style.color = ''; // Clear any override
                rollBtn.style.zIndex = '100'; // Ensure it's on top
                rollBtn.style.position = 'relative'; // Ensure z-index works
            }
            
            console.log('🎲 updateDiceUI - Button state:', {
                currentBet: diceGame.currentBet,
                betType: diceGame.betType,
                isRolling: diceGame.isRolling,
                shouldDisable: shouldDisable,
                buttonDisabled: rollBtn.disabled,
                buttonExists: !!rollBtn,
                opacity: rollBtn.style.opacity,
                cursor: rollBtn.style.cursor
            });
        }
        
        // Update dice game status
        function updateDiceGameStatus(message, colorClass = 'text-dt-cyan') {
            const statusElement = document.getElementById('diceResult');
            if (statusElement) {
                statusElement.textContent = message;
                statusElement.className = `text-center text-xl md:text-2xl font-bold ${colorClass} mb-4 min-h-[2rem]`;
            } else {
                console.warn('⚠️ Status element not found: diceResult');
            }
        }

        // Send dice roll request to server
        function sendDiceRoll() {
            const userData = JSON.parse(localStorage.getItem('vegas.customerData') || '{}');
            
            const payload = {
                Username: userData.customerName || localStorage.getItem('vegasUsername') || 'Anonymous',
                CustomerName: userData.customerName || localStorage.getItem('vegasUsername') || 'Anonymous',
                Email: userData.email || 'user@demo.com',
                CompanyName: userData.companyName || 'Demo Company',
                Persona: userData.persona || 'Demo User',
                Booth: userData.booth || 'UI Demo',
                OptIn: userData.optIn !== false,
                BetAmount: diceGame.currentBet,
                balance: diceGame.balance + diceGame.currentBet, // Send balance before deduction
                Balance: diceGame.balance + diceGame.currentBet,
                BetType: diceGame.betType,
                Game: 'Vegas Dice Roll',
                Action: 'Roll',
                GameState: 'Started',
                Device: 'Browser-UI',
                CheatActive: diceCheatState.active !== null,
                CheatType: diceCheatState.active,
                CheatDetails: diceCheatState.active ? {
                    type: diceCheatState.active,
                    description: diceCheatMethods[diceCheatState.active]?.description || ''
                } : null,
                correlationId: 'ui_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            };

            console.log('🎲 Sending dice roll request:', payload);

            fetch('/api/dice/roll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Vegas-Casino-UI'
                },
                body: JSON.stringify(payload)
            }).then(response => response.json())
            .then(data => {
                console.log('🎲 Dice roll response:', data);
            }).catch(error => {
                console.error('❌ Error sending dice roll:', error);
            });
        }

        // Send dice result to server
        function sendDiceResult(result, dice1, dice2, total, winAmount = 0, lossAmount = 0) {
            const userData = JSON.parse(localStorage.getItem('vegas.customerData') || '{}');
            
            // Use the original balance before any deductions
            const originalBalance = diceGame.originalBalance || (diceGame.balance + diceGame.currentBet);
            
            const payload = {
                Username: userData.customerName || localStorage.getItem('vegasUsername') || 'Anonymous',
                CustomerName: userData.customerName || localStorage.getItem('vegasUsername') || 'Anonymous',
                Email: userData.email || 'user@demo.com',
                CompanyName: userData.companyName || 'Demo Company',
                Persona: userData.persona || 'Demo User',
                Booth: userData.booth || 'UI Demo',
                OptIn: userData.optIn !== false,
                BetAmount: diceGame.currentBet,
                balance: originalBalance, // Original balance before bet
                newBalance: diceGame.balance, // Final balance after win/loss
                Balance: diceGame.balance, // Final balance
                BetType: diceGame.betType,
                Game: 'Vegas Dice',
                Action: 'RollCompleted',
                Status: 'Completed',
                Result: result, // 'win' or 'lose'
                dice1: dice1,
                dice2: dice2,
                sum: total,
                win: winAmount > 0,
                payout: winAmount,
                payoutMultiplier: winAmount > 0 ? (winAmount / diceGame.currentBet) : 0,
                WinningAmount: winAmount,
                LossAmount: lossAmount,
                WinFlag: winAmount > 0 ? 1 : 0,
                Device: 'Browser-UI',
                CheatActive: diceCheatState.active !== null,
                CheatType: diceCheatState.active,
                CheatDetails: diceCheatState.active ? {
                    type: diceCheatState.active,
                    description: diceCheatMethods[diceCheatState.active]?.description || ''
                } : null,
                correlationId: 'ui_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString()
            };

            console.log('🎲 Sending dice result:', {
                originalBalance: originalBalance,
                finalBalance: diceGame.balance,
                betAmount: diceGame.currentBet,
                winAmount: winAmount,
                payload: payload
            });

            fetch('/api/dice/roll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Vegas-Casino-UI'
                },
                body: JSON.stringify(payload)
            }).then(response => response.json())
            .then(data => {
                console.log('🎲 Dice result response:', data);
            }).catch(error => {
                console.error('❌ Error sending dice result:', error);
            });
        }
        
        // Debug function to manually test button state
        function debugDiceState() {
            console.log('🎲 DICE DEBUG STATE:', {
                currentBet: diceGame.currentBet,
                betType: diceGame.betType,
                isRolling: diceGame.isRolling,
                buttonElement: document.getElementById('rollDiceBtn'),
                buttonDisabled: document.getElementById('rollDiceBtn')?.disabled
            });
            return diceGame;
        }

        // Force enable button for testing
        function forceEnableDiceButton() {
            const btn = document.getElementById('rollDiceBtn');
            if (btn) {
                btn.disabled = false;
                console.log('🎲 Button force enabled for testing');
            }
        }

        
        // Initialize router - DISABLED: Now handled by lockout system
        // const router = new VegasRouter();
        
        // document.addEventListener('DOMContentLoaded', () => {
        //     console.log('🚀 DOMContentLoaded fired');
        //     
        //     try {
        //         router.init();
        //         console.log('✅ Router initialized successfully');
        //     } catch (error) {
        //         console.error('❌ Router initialization failed:', error);
        //     }
        //     
        //     console.log('✅ Vegas Casino SPA Ready!');
        //     
        //     // Check if current user is locked out immediately
        //     try {
        //         console.log('🔍 Starting lockout check...');
        //         checkLockoutStatus();
        //     } catch (error) {
        //         console.error('❌ Lockout check failed:', error);
        //     }
        //     
        //     // Also check lockout status every 30 seconds
        //     setInterval(() => {
        //         try {
        //             checkLockoutStatus();
        //         } catch (error) {
        //             console.error('❌ Periodic lockout check failed:', error);
        //         }
        //     }, 30000);
        //     
        //     // Add hash change listener for dice game
        //     window.addEventListener('hashchange', () => {
        //         setTimeout(ensureDiceGameReady, 300);
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
