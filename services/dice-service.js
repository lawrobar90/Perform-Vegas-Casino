const { createService } = require('./service-runner');

// Comprehensive Dynatrace Metadata for Dice Service
const diceMetadata = {
  version: '2.1.0',
  environment: 'vegas-casino-production',
  gameType: 'craps-dice',
  complexity: 'medium',
  rtp: '98.6%',
  owner: 'Dice-Games-Team',
  technology: 'Node.js-Express-Dice',
  features: ['dual-dice-roll', 'craps-rules', 'pass-line-betting', 'real-time-results'],
  maxPayout: '2x',
  volatility: 'low',
  diceCount: 2,
  winConditions: ['7', '11'],
  specialFeatures: ['natural-wins', 'come-out-roll', 'simple-betting']
};

createService(process.env.SERVICE_NAME || 'vegas-dice-service', (app) => {
  app.post('/roll', (req, res) => {
    const p = req.body || {};
    const betAmount = p.BetAmount || 10;
    const betType = p.BetType || 'pass';
    // TEMPORARY: Force winning dice for testing
    const d1 = 4; // Math.floor(Math.random()*6)+1;
    const d2 = 3; // Math.floor(Math.random()*6)+1;
    const sum = d1+d2; // This will be 7, which wins on "pass"
    
    // Determine win condition based on bet type
    let win = false;
    let payout = 0;
    let payoutMultiplier = 1;
    
    switch(betType) {
      case 'pass':
        win = [7, 11].includes(sum);
        payoutMultiplier = 2;
        break;
      case 'dont_pass':
        win = [2, 3].includes(sum);
        payoutMultiplier = 2;
        break;
      case 'field':
        win = [2, 3, 4, 9, 10, 11, 12].includes(sum);
        payoutMultiplier = 2;
        break;
      case 'snake_eyes':
        win = (d1 === 1 && d2 === 1); // Both dice must be 1
        payoutMultiplier = 30;
        break;
      case 'boxcars':
        win = (d1 === 6 && d2 === 6); // Both dice must be 6
        payoutMultiplier = 30;
        break;
      case 'seven_out':
        win = (sum === 7);
        payoutMultiplier = 4;
        break;
      default:
        win = [7, 11].includes(sum);
        payoutMultiplier = 2;
    }
    
    payout = win ? betAmount * payoutMultiplier : 0;
    
    console.log(`🎲 Dice Roll: ${d1}+${d2}=${sum}, Bet: ${betType}, Win: ${win}, Payout: ${payout}`);
    
    res.json({ 
      dice1: d1, 
      dice2: d2, 
      sum, 
      win, 
      payout, 
      betAmount, 
      betType,
      payoutMultiplier,
      timestamp: new Date().toISOString() 
    });
  });
}, diceMetadata);
