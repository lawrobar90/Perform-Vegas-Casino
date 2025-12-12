const { createService } = require('./service-runner');

// Comprehensive Dynatrace Metadata for Roulette Service
const rouletteMetadata = {
  version: '2.1.0',
  environment: 'vegas-casino-production',
  gameType: 'european-roulette',
  complexity: 'high',
  rtp: '97.3%',
  owner: 'Table-Games-Team',
  technology: 'Node.js-Express-Roulette',
  features: ['multiple-bet-types', 'live-wheel', 'cheat-detection', 'advanced-statistics'],
  maxPayout: '36x',
  volatility: 'medium',
  wheelType: '37-number-european',
  betTypes: ['straight', 'split', 'street', 'corner', 'red-black', 'odd-even'],
  specialFeatures: ['pattern-detection', 'hot-cold-numbers', 'betting-strategies']
};

createService(process.env.SERVICE_NAME || 'vegas-roulette-service', (app) => {
  app.post('/spin', (req, res) => {
    const p = req.body || {};
    
    // Check if cheating is active
    const cheatActive = p.CheatActive === true;
    const cheatType = p.CheatType;
    
    let winningNumber = Math.floor(Math.random()*37);
    let cheatBoosted = false;
    
    // Apply cheat logic to influence outcomes
    if (cheatActive && p.BetType === 'multiple' && p.BetValue && typeof p.BetValue === 'object') {
      // Analyze the bets to potentially boost favorable outcomes
      const playerBets = Object.entries(p.BetValue);
      
      // Apply cheat probability boost based on cheat type
      const boostChance = getCheatBoostChance(cheatType);
      
      if (Math.random() < boostChance) {
        cheatBoosted = true;
        
        // Try to find a winning number for the player's bets
        const potentialWinningNumbers = [];
        
        for (let testNumber = 0; testNumber <= 36; testNumber++) {
          const testRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
          const testColor = testNumber === 0 ? 'green' : (testRed.includes(testNumber) ? 'red' : 'black');
          
          for (const [, bet] of playerBets) {
            if (!bet || typeof bet !== 'object') continue;
            
            let wouldWin = false;
            if (bet.type === 'straight' && testNumber === Number(bet.value)) wouldWin = true;
            else if (bet.type === 'red' && testColor === 'red') wouldWin = true;
            else if (bet.type === 'black' && testColor === 'black') wouldWin = true;
            else if (bet.type === 'even' && testNumber > 0 && testNumber % 2 === 0) wouldWin = true;
            else if (bet.type === 'odd' && testNumber > 0 && testNumber % 2 === 1) wouldWin = true;
            else if (bet.type === 'low' && testNumber >= 1 && testNumber <= 18) wouldWin = true;
            else if (bet.type === 'high' && testNumber >= 19 && testNumber <= 36) wouldWin = true;
            
            if (wouldWin) {
              potentialWinningNumbers.push(testNumber);
              break; // Found a winning number for this bet
            }
          }
        }
        
        // Use a favorable number if available
        if (potentialWinningNumbers.length > 0) {
          winningNumber = potentialWinningNumbers[Math.floor(Math.random() * potentialWinningNumbers.length)];
        }
      }
    }
    
    const red = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    const color = winningNumber===0 ? 'green' : (red.includes(winningNumber)?'red':'black');
    let payout = 0;
    let anyWin = false;
    // Support multiple bets structure from UI: BetType: 'multiple', BetValue: { key: { type, value, amount } }
    if (p.BetType === 'multiple' && p.BetValue && typeof p.BetValue === 'object') {
      for (const [, bet] of Object.entries(p.BetValue)) {
        if (!bet || typeof bet !== 'object') continue;
        const amount = Number(bet.amount || 0);
        const type = bet.type;
        const val = bet.value;
        let win = false;
        let multi = 0;
        if (type === 'straight') {
          win = (winningNumber === Number(val));
          multi = 35;
        } else if (type === 'red') {
          win = (color === 'red');
          multi = 1;
        } else if (type === 'black') {
          win = (color === 'black');
          multi = 1;
        } else if (type === 'even') {
          win = (winningNumber > 0 && winningNumber % 2 === 0);
          multi = 1;
        } else if (type === 'odd') {
          win = (winningNumber > 0 && winningNumber % 2 === 1);
          multi = 1;
        } else if (type === 'low') { // 1-18
          win = (winningNumber >= 1 && winningNumber <= 18);
          multi = 1;
        } else if (type === 'high') { // 19-36
          win = (winningNumber >= 19 && winningNumber <= 36);
          multi = 1;
        }
        if (win && amount > 0) {
          payout += amount * (multi + 1); // return stake + winnings (align with UI calc)
          anyWin = true;
        }
      }
    } else {
      // Fallback simple color bet
      const betAmount = Number(p.BetAmount || 10);
      const isWin = color === (p.BetType||'red');
      payout = isWin ? betAmount * 2 : 0; // include stake back
      anyWin = isWin;
    }
    res.json({ 
      winningNumber, 
      color, 
      win: anyWin, 
      payout, 
      timestamp: new Date().toISOString(),
      // Add cheat metadata to response
      cheatActive: cheatActive,
      cheatType: cheatType,
      cheatBoosted: cheatBoosted
    });
  });

  // Helper function to determine cheat boost chance based on cheat type
  function getCheatBoostChance(cheatType) {
    const cheatBoostChances = {
      ballControl: 0.30,     // 30% chance to influence outcome
      wheelBias: 0.25,       // 25% chance 
      magneticField: 0.40,   // 40% chance (highest risk, highest reward)
      sectorPrediction: 0.35 // 35% chance
    };
    
    return cheatBoostChances[cheatType] || 0;
  }
}, rouletteMetadata);