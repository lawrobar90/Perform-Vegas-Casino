/**
 * Vegas Casino Roulette Service
 * A lightweight service for roulette game logic
 */

const express = require('express');
const app = express();
const port = process.env.PORT || 8082;

// Set service name for Dynatrace
process.env.DT_SERVICE_NAME = process.env.SERVICE_NAME || 'vegas-roulette-service';

app.use(express.json());

// Roulette wheel numbers (European style - no 00)
const rouletteNumbers = [
  { number: 0, color: 'green', parity: null },
  { number: 1, color: 'red', parity: 'odd' },
  { number: 2, color: 'black', parity: 'even' },
  { number: 3, color: 'red', parity: 'odd' },
  { number: 4, color: 'black', parity: 'even' },
  { number: 5, color: 'red', parity: 'odd' },
  { number: 6, color: 'black', parity: 'even' },
  { number: 7, color: 'red', parity: 'odd' },
  { number: 8, color: 'black', parity: 'even' },
  { number: 9, color: 'red', parity: 'odd' },
  { number: 10, color: 'black', parity: 'even' },
  { number: 11, color: 'black', parity: 'odd' },
  { number: 12, color: 'red', parity: 'even' },
  { number: 13, color: 'black', parity: 'odd' },
  { number: 14, color: 'red', parity: 'even' },
  { number: 15, color: 'black', parity: 'odd' },
  { number: 16, color: 'red', parity: 'even' },
  { number: 17, color: 'black', parity: 'odd' },
  { number: 18, color: 'red', parity: 'even' },
  { number: 19, color: 'red', parity: 'odd' },
  { number: 20, color: 'black', parity: 'even' },
  { number: 21, color: 'red', parity: 'odd' },
  { number: 22, color: 'black', parity: 'even' },
  { number: 23, color: 'red', parity: 'odd' },
  { number: 24, color: 'black', parity: 'even' },
  { number: 25, color: 'red', parity: 'odd' },
  { number: 26, color: 'black', parity: 'even' },
  { number: 27, color: 'red', parity: 'odd' },
  { number: 28, color: 'black', parity: 'even' },
  { number: 29, color: 'black', parity: 'odd' },
  { number: 30, color: 'red', parity: 'even' },
  { number: 31, color: 'black', parity: 'odd' },
  { number: 32, color: 'red', parity: 'even' },
  { number: 33, color: 'black', parity: 'odd' },
  { number: 34, color: 'red', parity: 'even' },
  { number: 35, color: 'black', parity: 'odd' },
  { number: 36, color: 'red', parity: 'even' }
];

// Roulette spin endpoint
app.post('/spin', (req, res) => {
  try {
    const { betAmount = 10, betType = 'red', Username = 'Anonymous' } = req.body;
    
    // Spin the wheel
    const result = rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];
    
    // Calculate win/loss
    let winAmount = 0;
    let won = false;
    
    switch (betType.toLowerCase()) {
      case 'red':
        won = result.color === 'red';
        winAmount = won ? betAmount * 2 : 0;
        break;
      case 'black':
        won = result.color === 'black';
        winAmount = won ? betAmount * 2 : 0;
        break;
      case 'even':
        won = result.parity === 'even' && result.number !== 0;
        winAmount = won ? betAmount * 2 : 0;
        break;
      case 'odd':
        won = result.parity === 'odd';
        winAmount = won ? betAmount * 2 : 0;
        break;
      case 'green':
      case '0':
        won = result.number === 0;
        winAmount = won ? betAmount * 35 : 0;
        break;
      default:
        // Straight number bet
        const betNumber = parseInt(betType);
        if (!isNaN(betNumber) && betNumber >= 0 && betNumber <= 36) {
          won = result.number === betNumber;
          winAmount = won ? betAmount * 35 : 0;
        }
    }
    
    const responseData = {
      result: result,
      betType: betType,
      betAmount: betAmount,
      won: won,
      winAmount: winAmount,
      payout: won ? (winAmount / betAmount) : 0,
      timestamp: new Date().toISOString(),
      gameId: `roulette_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      Username: Username
    };
    
    console.log(`🎰 Roulette spin: ${Username} bet $${betAmount} on ${betType}, result: ${result.number} ${result.color}, ${won ? 'WON' : 'LOST'} $${winAmount}`);
    
    res.json(responseData);
    
  } catch (error) {
    console.error('Roulette service error:', error);
    res.status(500).json({
      error: 'Roulette service error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'vegas-roulette-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: port,
    uptime: process.uptime()
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    service: 'vegas-roulette-service',
    version: '1.0.0',
    type: 'european-roulette',
    numbers: rouletteNumbers.length,
    payouts: {
      'red/black/even/odd': '2:1',
      'straight': '35:1',
      'green/zero': '35:1'
    }
  });
});

const server = app.listen(port, () => {
  console.log(`🎰 Vegas Roulette Service running on port ${port}`);
  console.log(`🔗 Service Name: ${process.env.DT_SERVICE_NAME}`);
  console.log(`🎯 Process Group: ${process.env.DT_PROCESS_GROUP_ID || 'default'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Roulette service shutting down...');
  server.close(() => {
    console.log('✅ Roulette service stopped');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Roulette service interrupted...');
  server.close(() => {
    console.log('✅ Roulette service stopped');
    process.exit(0);
  });
});

module.exports = app;