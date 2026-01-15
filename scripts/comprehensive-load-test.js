/**
 * Comprehensive Vegas Casino Load Testing Script
 * Generates realistic customer journey data with detailed telemetry
 */

class VegasCasinoLoadTester {
    constructor() {
        this.isRunning = false;
        this.testInterval = null;
        this.customers = [];
        this.startTime = null;
        
        // Customer personas with realistic profiles
        this.customerProfiles = [
            {
                id: 0,
                customer_name: "John Smith",
                email: "john@email.com",
                company_name: "TechCorp",
                persona: "Developer",
                booth: "Demo Booth 1",
                balance: 1000,
                behavior: {
                    gamePreferences: ["slots", "roulette", "dice"],
                    betPattern: "conservative", // conservative, moderate, aggressive
                    cheatProbability: 0.05,
                    sessionLength: 600000 // 10 minutes
                }
            },
            {
                id: 1,
                customer_name: "Sarah Johnson",
                email: "sarah@company.com",
                company_name: "DataCorp",
                persona: "Manager",
                booth: "Demo Booth 2",
                balance: 1000,
                behavior: {
                    gamePreferences: ["roulette", "blackjack", "dice"],
                    betPattern: "moderate",
                    cheatProbability: 0.08,
                    sessionLength: 900000 // 15 minutes
                }
            },
            {
                id: 2,
                customer_name: "Mike Wilson",
                email: "mike@startup.io",
                company_name: "StartupInc",
                persona: "CTO",
                booth: "Training Session",
                balance: 1000,
                behavior: {
                    gamePreferences: ["slots", "blackjack", "dice"],
                    betPattern: "aggressive",
                    cheatProbability: 0.03,
                    sessionLength: 1200000 // 20 minutes
                }
            },
            {
                id: 3,
                customer_name: "Lisa Brown",
                email: "lisa@enterprise.com",
                company_name: "Enterprise Ltd",
                persona: "Analyst",
                booth: "Partner Demo",
                balance: 1000,
                behavior: {
                    gamePreferences: ["slots", "roulette"],
                    betPattern: "conservative",
                    cheatProbability: 0.02,
                    sessionLength: 480000 // 8 minutes
                }
            },
            {
                id: 4,
                customer_name: "David Lee",
                email: "david@consulting.com",
                company_name: "ConsultCorp",
                persona: "Consultant",
                booth: "POC Demo",
                balance: 1000,
                behavior: {
                    gamePreferences: ["dice", "blackjack", "roulette"],
                    betPattern: "moderate",
                    cheatProbability: 0.06,
                    sessionLength: 720000 // 12 minutes
                }
            },
            {
                id: 5,
                customer_name: "Emma Davis",
                email: "emma@fintech.com",
                company_name: "FinTech Solutions",
                persona: "Engineer",
                booth: "Technical Demo",
                balance: 1000,
                behavior: {
                    gamePreferences: ["blackjack", "slots"],
                    betPattern: "aggressive",
                    cheatProbability: 0.04,
                    sessionLength: 600000 // 10 minutes
                }
            },
            {
                id: 6,
                customer_name: "Jenny Kim",
                email: "jenny@healthcare.org",
                company_name: "HealthSystem",
                persona: "IT Manager",
                booth: "Healthcare Demo",
                balance: 1000,
                behavior: {
                    gamePreferences: ["dice", "roulette"],
                    betPattern: "moderate",
                    cheatProbability: 0.07,
                    sessionLength: 540000 // 9 minutes
                }
            },
            {
                id: 7,
                customer_name: "Carlos Rodriguez",
                email: "carlos@manufacturing.com",
                company_name: "MFG Corp",
                persona: "Operations Manager",
                booth: "Industry Demo",
                balance: 1000,
                behavior: {
                    gamePreferences: ["slots", "dice", "blackjack"],
                    betPattern: "conservative",
                    cheatProbability: 0.05,
                    sessionLength: 780000 // 13 minutes
                }
            }
        ];

        // Slot machine symbols for realistic results
        this.slotSymbols = [
            "dynatrace", "smartscape", "application", "server", 
            "database", "cloud", "shield", "network"
        ];

        // Cheat types for security alerts
        this.cheatTypes = [
            "cardCounting", "streakBooster", "autoPlay", 
            "balanceManipulation", "resultPrediction"
        ];

        // Bet patterns
        this.betPatterns = {
            conservative: [10, 25, 50],
            moderate: [25, 50, 100],
            aggressive: [50, 100, 250, 500]
        };
    }

    generateCorrelationId(customerId) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000000);
        return `load_test_${timestamp}_${customerId}_${random}`;
    }

    // Monitor and replenish customer balances if needed
    checkAndReplenishBalances() {
        const lowBalanceThreshold = 200;
        const replenishAmount = 2000;
        
        this.customers.forEach(customer => {
            if (customer.balance < lowBalanceThreshold) {
                customer.balance += replenishAmount;
                console.log(`🏦 Balance monitor: Replenished ${customer.customer_name} -> $${customer.balance}`);
            }
        });
    }

    getBetAmount(customer) {
        const pattern = this.betPatterns[customer.behavior.betPattern];
        const desiredBet = pattern[Math.floor(Math.random() * pattern.length)];
        
        // Check if customer has sufficient balance - add $500 if low
        if (customer.balance < desiredBet) {
            console.log(`💰 ${customer.customer_name} insufficient balance: $${customer.balance} < $${desiredBet}`);
            
            // Add $500 as requested
            customer.balance += 500;
            console.log(`🔄 Added $500 to ${customer.customer_name} -> New balance: $${customer.balance}`);
            
            // If still insufficient after $500, add enough for the bet
            if (customer.balance < desiredBet) {
                const additionalAmount = desiredBet - customer.balance + 100; // Add a bit extra
                customer.balance += additionalAmount;
                console.log(`💳 Added additional $${additionalAmount} to cover bet -> Balance: $${customer.balance}`);
            }
        }
        
        return desiredBet;
    }

    generateSlotResult() {
        return [
            this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)],
            this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)],
            this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)]
        ];
    }

    calculateSlotWin(bet, result) {
        const symbol1 = result[0];
        const symbol2 = result[1];
        const symbol3 = result[2];

        // Three of a kind
        if (symbol1 === symbol2 && symbol2 === symbol3) {
            return { win: bet * 5, multiplier: 5 };
        }
        
        // Two of a kind
        if (symbol1 === symbol2 || symbol2 === symbol3 || symbol1 === symbol3) {
            return { win: bet * 2, multiplier: 2 };
        }

        // Random small wins occasionally
        if (Math.random() < 0.1) {
            return { win: Math.floor(bet * 1.5), multiplier: 1 };
        }

        return { win: 0, multiplier: 0 };
    }

    async logGameActivity(customer, game, action, bet, win, result = null, cheatActive = false, cheatType = null) {
        const balanceBefore = customer.balance;
        customer.balance = customer.balance - bet + win;
        const balanceAfter = customer.balance;

        const activityLog = {
            timestamp: new Date().toISOString(),
            level: cheatActive ? "SECURITY_ALERT" : "INFO",
            event_type: "CASINO_GAME_ACTIVITY",
            game: game,
            action: action,
            customer_name: customer.customer_name,
            email: customer.email,
            company_name: customer.company_name,
            persona: customer.persona,
            booth: customer.booth,
            bet_amount: bet,
            win_amount: win,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            result: result,
            multiplier: result && game === "slots" ? this.calculateSlotWin(bet, result).multiplier : 0,
            cheat_active: cheatActive,
            cheat_type: cheatType,
            cheat_win_boost_applied: cheatActive,
            cheat_original_win: cheatActive ? 0 : win,
            cheat_boosted_win: cheatActive ? win : 0,
            correlation_id: this.generateCorrelationId(customer.id),
            user_agent: "Vegas-Casino-Browser",
            ip_address: "internal",
            opt_in: true,
            severity: cheatActive ? "HIGH" : "LOW",
            category: cheatActive ? "FRAUD_DETECTION" : "GAME_ACTIVITY",
            requires_investigation: cheatActive
        };

        try {
            const response = await fetch('/api/log-activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activityLog)
            });

            if (!response.ok) {
                console.log('Failed to log activity:', response.statusText);
            }
        } catch (error) {
            console.log('Error logging activity:', error);
        }
    }

    async simulateSlots(customer) {
        const bet = this.getBetAmount(customer);
        const result = this.generateSlotResult();
        const { win, multiplier } = this.calculateSlotWin(bet, result);
        
        // Check for cheat attempt
        const cheatActive = Math.random() < customer.behavior.cheatProbability;
        const cheatType = cheatActive ? this.cheatTypes[Math.floor(Math.random() * this.cheatTypes.length)] : null;
        const finalWin = cheatActive ? Math.max(win, bet * 3) : win;

        await this.logGameActivity(customer, "slots", "spin", bet, finalWin, result, cheatActive, cheatType);
    }

    async simulateRoulette(customer) {
        const bet = this.getBetAmount(customer);
        let win = 0;

        // Roulette win probability (roughly 47.4% for red/black)
        if (Math.random() < 0.474) {
            win = Math.floor(bet * (1.5 + Math.random() * 0.8)); // 1.5x to 2.3x payout
        }

        // Check for cheat attempt
        const cheatActive = Math.random() < customer.behavior.cheatProbability;
        const cheatType = cheatActive ? this.cheatTypes[Math.floor(Math.random() * this.cheatTypes.length)] : null;
        const finalWin = cheatActive ? Math.max(win, bet * 2) : win;

        await this.logGameActivity(customer, "roulette", "spin", bet, finalWin, null, cheatActive, cheatType);
    }

    async simulateDice(customer) {
        const bet = this.getBetAmount(customer);
        let win = 0;

        // Dice win probability (varies by bet type)
        const winChance = Math.random();
        if (winChance < 0.45) {
            win = bet * 2; // Double money
        } else if (winChance < 0.50) {
            win = bet * 4; // Quadruple money
        }

        // Check for cheat attempt
        const cheatActive = Math.random() < customer.behavior.cheatProbability;
        const cheatType = cheatActive ? this.cheatTypes[Math.floor(Math.random() * this.cheatTypes.length)] : null;
        const finalWin = cheatActive ? Math.max(win, bet * 4) : win;

        await this.logGameActivity(customer, "dice", "roll", bet, finalWin, null, cheatActive, cheatType);
    }

    async simulateBlackjack(customer) {
        const bet = this.getBetAmount(customer);
        let win = 0;

        // Blackjack typically starts with dealing cards
        await this.logGameActivity(customer, "blackjack", "deal", bet, 0, "cards dealt");

        // Simulate game result after a short delay
        setTimeout(async () => {
            // Blackjack win probability (roughly 43% player wins)
            if (Math.random() < 0.43) {
                win = Math.floor(bet * 2); // Standard blackjack payout
                if (Math.random() < 0.048) { // ~4.8% chance of blackjack
                    win = Math.floor(bet * 2.5); // Blackjack pays 3:2
                }
            }

            const cheatActive = Math.random() < customer.behavior.cheatProbability;
            const cheatType = cheatActive ? this.cheatTypes[Math.floor(Math.random() * this.cheatTypes.length)] : null;
            const finalWin = cheatActive ? Math.max(win, bet * 2) : win;

            await this.logGameActivity(customer, "blackjack", "result", 0, finalWin, null, cheatActive, cheatType);
        }, 2000 + Math.random() * 3000);
    }

    async simulateCustomerActivity() {
        if (!this.isRunning) return;

        // Select random customer
        const customer = this.customers[Math.floor(Math.random() * this.customers.length)];
        
        // Select game based on customer preferences
        const game = customer.behavior.gamePreferences[
            Math.floor(Math.random() * customer.behavior.gamePreferences.length)
        ];

        // Simulate the selected game
        switch (game) {
            case "slots":
                await this.simulateSlots(customer);
                break;
            case "roulette":
                await this.simulateRoulette(customer);
                break;
            case "dice":
                await this.simulateDice(customer);
                break;
            case "blackjack":
                await this.simulateBlackjack(customer);
                break;
        }
    }

    start() {
        if (this.isRunning) {
            console.log('🟡 Load test already running');
            return;
        }

        this.isRunning = true;
        this.startTime = Date.now();
        
        // Initialize customers with fresh balances
        this.customers = this.customerProfiles.map(profile => ({
            ...profile,
            balance: 1000 + Math.floor(Math.random() * 2000) // Starting balance between 1000-3000
        }));

        console.log('🚀 Starting comprehensive Vegas Casino load test');
        console.log(`👥 Simulating ${this.customers.length} customers`);
        console.log('💰 Balance monitoring enabled - customers will be auto-replenished');
        
        // Start simulation with varied intervals (1-8 seconds between activities)
        const scheduleNext = () => {
            if (!this.isRunning) return;
            
            this.simulateCustomerActivity().then(() => {
                const nextInterval = 1000 + Math.random() * 7000; // 1-8 seconds
                setTimeout(scheduleNext, nextInterval);
            });
        };

        // Start periodic balance monitoring (every 30 seconds)
        const balanceMonitor = () => {
            if (!this.isRunning) return;
            
            this.checkAndReplenishBalances();
            setTimeout(balanceMonitor, 30000); // Check every 30 seconds
        };

        scheduleNext();
        balanceMonitor();
    }

    stop() {
        if (!this.isRunning) {
            console.log('🟡 Load test not running');
            return;
        }

        this.isRunning = false;
        const duration = Date.now() - this.startTime;
        
        console.log('🛑 Stopping comprehensive Vegas Casino load test');
        console.log(`⏱️  Test duration: ${Math.floor(duration / 1000)} seconds`);
        
        // Reset customer balances
        this.customers = [];
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            customers: this.customers.length,
            duration: this.startTime ? Date.now() - this.startTime : 0
        };
    }
}

// Export for use in server
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VegasCasinoLoadTester;
}

// Global instance for browser use
if (typeof window !== 'undefined') {
    window.VegasCasinoLoadTester = VegasCasinoLoadTester;
}