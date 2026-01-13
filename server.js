
/**
 * Dynatrace Vegas Casino Server
 * A Node.js casino application with Smartscape-inspired UI and real-time telemetry
 * 
 * Features:
 * - WebSocket-based real-time metric updates
 * - Telemetry simulation via /metrics route
 * - Game APIs for Slots, Dice Roll, and Blackjack
 * - Dynatrace-style logging and monitoring
 */

const express = require('express');
const http = require('http');
const { spawn } = require('child_process');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const appendFile = promisify(fs.appendFile);
const mkdir = promisify(fs.mkdir);

// Health Monitoring and Self-Healing Configuration
const HEALTH_CONFIG = {
    startTime: Date.now(),
    errorThreshold: 100,          // Max errors per hour before restart
    memoryThreshold: 1024 * 1024 * 1024, // 1GB memory limit
    healthCheckInterval: 30000,    // 30 seconds
    logCleanupInterval: 3600000,   // 1 hour
    maxLogFileSize: 100 * 1024 * 1024, // 100MB
    errorCounts: { hour: 0, total: 0 },
    lastErrorReset: Date.now(),
    isHealthy: true
};

// Error tracking and recovery
function trackError(error, context = 'unknown') {
    HEALTH_CONFIG.errorCounts.total++;
    HEALTH_CONFIG.errorCounts.hour++;
    
    const now = Date.now();
    if (now - HEALTH_CONFIG.lastErrorReset > 3600000) { // Reset hourly counter
        HEALTH_CONFIG.errorCounts.hour = 1;
        HEALTH_CONFIG.lastErrorReset = now;
    }
    
    console.error(`🚨 [ERROR-TRACKING] ${context}:`, error.message);
    console.error(`📊 [ERROR-STATS] Hourly: ${HEALTH_CONFIG.errorCounts.hour}/${HEALTH_CONFIG.errorThreshold}, Total: ${HEALTH_CONFIG.errorCounts.total}`);
    
    // Check if we need to take action
    if (HEALTH_CONFIG.errorCounts.hour >= HEALTH_CONFIG.errorThreshold) {
        console.error(`🔴 [CRITICAL] Error threshold exceeded - implementing recovery measures`);
        performSelfHealing();
    }
}

// Self-healing measures
function performSelfHealing() {
    console.log(`🔧 [SELF-HEAL] Starting recovery procedures...`);
    
    try {
        // Clear error counters
        HEALTH_CONFIG.errorCounts.hour = 0;
        HEALTH_CONFIG.lastErrorReset = Date.now();
        
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
            console.log(`♻️  [SELF-HEAL] Garbage collection triggered`);
        }
        
        // Clean up old log files
        cleanupLogFiles();
        
        // Reset any stuck processes
        resetStuckServices();
        
        console.log(`✅ [SELF-HEAL] Recovery procedures completed`);
    } catch (healingError) {
        console.error(`💥 [CRITICAL] Self-healing failed:`, healingError);
        // Last resort - graceful restart
        setTimeout(() => {
            console.log(`🔄 [RESTART] Initiating graceful restart...`);
            process.exit(1);
        }, 5000);
    }
}

// Memory and resource monitoring
function checkSystemHealth() {
    const memUsage = process.memoryUsage();
    const uptime = Date.now() - HEALTH_CONFIG.startTime;
    
    const healthStatus = {
        uptime: Math.floor(uptime / 1000),
        memory: {
            rss: memUsage.rss,
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external
        },
        errors: HEALTH_CONFIG.errorCounts,
        healthy: HEALTH_CONFIG.isHealthy,
        pid: process.pid
    };
    
    // Memory threshold check
    if (memUsage.heapUsed > HEALTH_CONFIG.memoryThreshold) {
        console.warn(`⚠️  [MEMORY] High memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
        if (global.gc) global.gc();
    }
    
    // Log health status every 10 minutes
    if (uptime % 600000 < 30000) { // Within 30s of 10min mark
        console.log(`💚 [HEALTH] Uptime: ${Math.floor(uptime/3600000)}h ${Math.floor((uptime%3600000)/60000)}m, Memory: ${Math.round(memUsage.heapUsed/1024/1024)}MB, Errors: ${HEALTH_CONFIG.errorCounts.hour}/hr`);
    }
    
    return healthStatus;
}

// Log file cleanup with 1-day retention (data preserved in Dynatrace)
function cleanupLogFiles() {
    try {
        const { execSync } = require('child_process');
        
        console.log('🗑️ [CLEANUP] Removing logs older than 1 day (preserved in Dynatrace)...');
        
        // Remove logs older than 1 day from main directory
        try {
            execSync('find . -maxdepth 1 -name "*.log" -type f -mtime +1 -delete 2>/dev/null || true', { cwd: __dirname });
            execSync('find . -maxdepth 1 -name "*.log.old" -type f -delete 2>/dev/null || true', { cwd: __dirname });
            execSync('find . -maxdepth 1 -name "*.log.backup" -type f -mtime +1 -delete 2>/dev/null || true', { cwd: __dirname });
            console.log('🎯 [CLEANUP] Main directory logs cleaned');
        } catch (err) {
            // Continue on error
        }
        
        // Remove old cheat detection logs
        try {
            const cheatLogsDir = path.join(__dirname, 'vegas-cheat-logs');
            if (fs.existsSync(cheatLogsDir)) {
                execSync('find vegas-cheat-logs -name "*.log" -type f -mtime +1 -delete 2>/dev/null || true', { cwd: __dirname });
                console.log('🕵️ [CLEANUP] Cheat detection logs cleaned');
            }
        } catch (err) {
            // Continue on error
        }
        
        // Remove old service logs
        try {
            const serviceLogsDir = path.join(__dirname, 'logs');
            if (fs.existsSync(serviceLogsDir)) {
                execSync('find logs -name "*.log" -type f -mtime +1 -delete 2>/dev/null || true', { cwd: __dirname });
                console.log('⚙️ [CLEANUP] Service logs cleaned');
            }
        } catch (err) {
            // Continue on error
        }
        
        // Rotate current logs if they're too large
        const logFiles = ['server.log', 'error.log', 'health-monitor.log'];
        logFiles.forEach(logFile => {
            try {
                const logPath = path.join(__dirname, logFile);
                if (fs.existsSync(logPath)) {
                    const stats = fs.statSync(logPath);
                    if (stats.size > HEALTH_CONFIG.maxLogFileSize) {
                        const backupPath = `${logPath}.${Date.now()}.bak`;
                        fs.renameSync(logPath, backupPath);
                        console.log(`📄 [CLEANUP] Rotated large log: ${logFile}`);
                    }
                }
            } catch (err) {
                // Continue on error
            }
        });
        
        // Clear temporary files
        try {
            execSync('rm -f nohup.out /tmp/vegas-casino-* 2>/dev/null || true');
            console.log('🧹 [CLEANUP] Temporary files cleared');
        } catch (err) {
            // Continue on error
        }
        
        console.log('✨ [CLEANUP] Log cleanup completed - disk usage optimized');
        
    } catch (error) {
        console.error(`❌ [CLEANUP] Log cleanup failed:`, error);
    }
}

// Reset stuck services
function resetStuckServices() {
    try {
        // Clear any timeouts/intervals that might be stuck
        const highestTimeoutId = setTimeout(() => {}, 0);
        for (let i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
        }
        console.log(`🔄 [RESET] Cleared stuck timers`);
    } catch (error) {
        console.error(`❌ [RESET] Service reset failed:`, error);
    }
}

// Global Error Handlers for 48+ hour uptime
process.on('uncaughtException', (error) => {
    console.error('🚨 [UNCAUGHT-EXCEPTION]', error);
    trackError(error, 'uncaughtException');
    // Don't exit immediately - try to recover
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 [UNHANDLED-REJECTION]', reason, 'at', promise);
    trackError(new Error(reason), 'unhandledRejection');
});

process.on('warning', (warning) => {
    console.warn('⚠️  [PROCESS-WARNING]', warning.name, warning.message, warning.stack);
});

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
    console.log(`🛑 [SHUTDOWN] Received ${signal}, shutting down gracefully...`);
    
    // Stop accepting new connections
    server.close(() => {
        console.log('📡 [SHUTDOWN] HTTP server closed');
        
        // Close database connections, cleanup, etc.
        setTimeout(() => {
            console.log('✅ [SHUTDOWN] Graceful shutdown complete');
            process.exit(0);
        }, 5000);
    });
    
    // Force exit after 10 seconds
    setTimeout(() => {
        console.error('💥 [SHUTDOWN] Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
}

// Enhanced logging function with error tracking
function logWithTrace(level, message, data = {}) {
    console.log(`[${level.toUpperCase()}] ${message}`);
    if (level.toLowerCase() === 'error') {
        trackError(new Error(message), 'application');
    }
}

// Remove OneAgent SDK: we'll rely on OneAgent auto-instrumentation only
const recordCustomMetric = () => { /* no-op: use request attributes via body capture instead */ };

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Trace context middleware for log correlation - TEMPORARILY DISABLED
/*
app.use((req, res, next) => {
  try {
    // Extract Dynatrace trace context from headers
    let traceId = req.headers['x-dynatrace-traceid'] || req.headers['dt-trace-id'];
    let spanId = req.headers['x-dynatrace-spanid'] || req.headers['dt-span-id'];
    
    // Parse traceparent header if available (W3C format: version-trace_id-span_id-flags)
    const traceparent = req.headers['traceparent'];
    if (!traceId && traceparent && typeof traceparent === 'string') {
      const parts = traceparent.split('-');
      if (parts.length >= 3) {
        traceId = parts[1];
        spanId = parts[2];
      }
    }
    
    // Fallback to generated IDs if none found
    if (!traceId) traceId = crypto.randomUUID();
    if (!spanId) spanId = crypto.randomUUID().substring(0, 16);
    
    // Store trace context in request for use in logging
    req.traceContext = {
      traceId,
      spanId,
      timestamp: new Date().toISOString()
    };
    
    // Set process env vars for child processes (temporary)
    process.env.DT_TRACE_ID = traceId;
    process.env.DT_SPAN_ID = spanId;
    
    next();
  } catch (error) {
    console.error('Error in trace context middleware:', error);
    // Continue without trace context if there's an error
    req.traceContext = {
      traceId: crypto.randomUUID(),
      spanId: crypto.randomUUID().substring(0, 16),
      timestamp: new Date().toISOString()
    };
    next();
  }
});
*/

// Middleware
// Custom JSON parser that handles Python-style syntax from Dynatrace
// Accept any content-type for this route because Dynatrace may send text/plain or other types
app.use('/api/admin/lockout-user-cheat', express.text({type: '*/*'}));
app.use('/api/admin/lockout-user-cheat', (req, res, next) => {
  if (req.body && typeof req.body === 'string') {
    try {
      console.log('📥 Raw text from Dynatrace:', req.body.substring(0, 200) + '...');
      
      // Handle complex Python-style JSON with nested JSON strings
      // First, temporarily protect nested JSON strings by encoding them
      let tempJson = req.body;
      
      // Find and encode all JSON strings within single quotes to protect them
      const jsonStringPattern = /'(\{[^}]*\})'/g;
      const protectedStrings = new Map();
      let protectCounter = 0;
      
      tempJson = tempJson.replace(jsonStringPattern, (match, jsonContent) => {
        const placeholder = `__PROTECTED_JSON_${protectCounter}__`;
        protectedStrings.set(placeholder, `"${jsonContent.replace(/"/g, '\\"')}"`);
        protectCounter++;
        return placeholder;
      });
      
      // Now safely convert Python syntax to JSON
      let fixedJson = tempJson
        .replace(/'/g, '"')                    // Single quotes to double quotes
        .replace(/False/g, 'false')            // Python False to JSON false
        .replace(/True/g, 'true')              // Python True to JSON true
        .replace(/None/g, 'null')              // Python None to JSON null
        .replace(/\bNone\b/g, 'null')          // Word boundary None
        .replace(/:\s*None\b/g, ': null')      // Handle ": None" patterns
        .replace(/\[\s*None\b/g, '[null')      // Handle "[ None" patterns  
        .replace(/,\s*None\b/g, ', null')      // Handle ", None" patterns
        .replace(/None\s*,/g, 'null,')         // Handle "None," patterns
        .replace(/None\s*\]/g, 'null]')        // Handle "None ]" patterns
        .replace(/None\s*}/g, 'null}');        // Handle "None }" patterns
      
      // Restore protected JSON strings
      protectedStrings.forEach((value, placeholder) => {
        fixedJson = fixedJson.replace(placeholder, value);
      });
      
      console.log('📥 Fixed JSON (first 200 chars):', fixedJson.substring(0, 200) + '...');
      req.body = JSON.parse(fixedJson);
      console.log('📥 Parsed body:', JSON.stringify(req.body, null, 2));
    } catch (e) {
      console.error('Failed to parse Python-style JSON:', e);
      return res.status(400).json({ 
        error: 'Invalid JSON format', 
        details: e.message,
        hint: 'Check for Python-style syntax (single quotes, False/True/None)',
        receivedText: req.body.substring(0, 200) + '...'
      });
    }
  }
  next();
});

app.use(express.json());

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Enhanced Dynatrace Metadata Middleware for Main Server
app.use((req, res, next) => {
  // Add custom headers for better Dynatrace visibility
  res.setHeader('DT-Application', 'Vegas-Casino-Main');
  res.setHeader('DT-Service-Name', 'vegas-casino-gateway');
  res.setHeader('DT-Service-Version', '2.1.0');
  res.setHeader('DT-Environment', 'vegas-casino-production');
  res.setHeader('DT-Owner', 'Vegas-Casino-Team');
  
  // Add request-specific metadata
  if (req.path.includes('/api/')) {
    const gameType = req.path.split('/')[2]; // slots, roulette, dice, blackjack
    res.setHeader('DT-Game-Request', gameType || 'unknown');
    res.setHeader('DT-Request-Type', 'api-proxy');
  } else {
    res.setHeader('DT-Request-Type', 'static-asset');
  }
  
  next();
});

// --- Internal service launcher & proxy (no SDK) ---
// We'll spawn lightweight child processes per service and proxy requests to them via HTTP.
// OneAgent will see separate processes/services and build a proper topology.
const childServices = {};
const SERVICE_PORTS = {
  'vegas-slots-service': 8081,
  'vegas-roulette-service': 8082,
  'vegas-dice-service': 8083,
  'vegas-blackjack-service': 8084
};

function startChildService(name, script, env = {}) {
  if (childServices[name]) return childServices[name];
  
  // Enhanced environment variables for better Dynatrace visibility
  const enhancedEnv = {
    ...process.env,
    PORT: String(SERVICE_PORTS[name] || 0),
    SERVICE_NAME: name,
    // Dynatrace Process Group and Service Naming for distinct visibility
    DT_PROCESS_GROUP_ID: `${name}-process-group`,
    DT_SERVICE_NAME: name,
    DT_APPLICATION_NAME: `Vegas-Casino-${getGameCategory(name)}`,
    DT_SERVICE_VERSION: '2.1.0',
    DT_ENVIRONMENT: 'vegas-casino-production',
    DT_CLUSTER_ID: getServiceCluster(name),
    DT_NODE_ID: `${name}-node`,
    // Custom Properties for enhanced game service visibility
    DT_CUSTOM_PROP_gameCategory: getGameCategory(name),
    DT_CUSTOM_PROP_serviceComplexity: getServiceComplexity(name),
    DT_CUSTOM_PROP_maxPayout: getMaxPayout(name),
    DT_CUSTOM_PROP_gameType: getGameType(name),
    DT_CUSTOM_PROP_businessUnit: getBusinessUnit(name),
    ...env
  };
  
  const child = spawn('node', [script], {
    cwd: __dirname,
    env: enhancedEnv,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.on('data', d => console.log(`[${name}] ${d.toString().trim()}`));
  child.stderr.on('data', d => console.error(`[${name}][ERR] ${d.toString().trim()}`));
  child.on('exit', code => {
    console.log(`[${name}] exited with code ${code}`);
    delete childServices[name];
  });
  childServices[name] = child;
  return child;
}

// Helper functions for Dynatrace metadata
function getGameCategory(serviceName) {
  const categories = {
    'vegas-slots-service': 'slot-machines',
    'vegas-roulette-service': 'table-games',
    'vegas-dice-service': 'dice-games',
    'vegas-blackjack-service': 'card-games'
  };
  return categories[serviceName] || 'unknown';
}

function getServiceComplexity(serviceName) {
  const complexity = {
    'vegas-slots-service': 'high',
    'vegas-roulette-service': 'high',
    'vegas-dice-service': 'medium',
    'vegas-blackjack-service': 'high'
  };
  return complexity[serviceName] || 'medium';
}

function getMaxPayout(serviceName) {
  const payouts = {
    'vegas-slots-service': '100x',
    'vegas-roulette-service': '36x',
    'vegas-dice-service': '2x',
    'vegas-blackjack-service': '2.5x'
  };
  return payouts[serviceName] || '1x';
}

// Additional helper functions for distinct Dynatrace process groups
function getServiceCluster(serviceName) {
  const clusters = {
    'vegas-slots-service': 'vegas-slots-cluster',
    'vegas-roulette-service': 'vegas-roulette-cluster',
    'vegas-dice-service': 'vegas-dice-cluster',
    'vegas-blackjack-service': 'vegas-blackjack-cluster'
  };
  return clusters[serviceName] || 'vegas-casino-cluster';
}

function getGameType(serviceName) {
  const gameTypes = {
    'vegas-slots-service': 'slots-machine',
    'vegas-roulette-service': 'european-roulette',
    'vegas-dice-service': 'craps-dice',
    'vegas-blackjack-service': 'blackjack-21'
  };
  return gameTypes[serviceName] || 'unknown';
}

function getBusinessUnit(serviceName) {
  const businessUnits = {
    'vegas-slots-service': 'Slot-Machine-Division',
    'vegas-roulette-service': 'Table-Games-Division',
    'vegas-dice-service': 'Dice-Games-Division',
    'vegas-blackjack-service': 'Card-Games-Division'
  };
  return businessUnits[serviceName] || 'Digital-Gaming';
}

function proxyJson(targetPort, req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url.replace(/^\/api\/(slots|roulette|dice|blackjack)/, ''),
    method: req.method,
    headers: { 'Content-Type': 'application/json' }
  };

  const proxyReq = http.request(options, proxyRes => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', err => {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'Service unavailable', details: err.message }));
  });
  if (req.body && Object.keys(req.body).length) {
    proxyReq.end(JSON.stringify(req.body));
  } else {
    proxyReq.end();
  }
}

// --- Simple in-memory user store for per-user balance persistence ---
const DEFAULT_START_BALANCE = 1000;
const users = new Map(); // key: username, value: { username, balance }

function getOrCreateUser(username, initialBalance = null) {
  const key = (username || 'Anonymous').trim() || 'Anonymous';
  if (!users.has(key)) {
    const balance = initialBalance !== null ? initialBalance : DEFAULT_START_BALANCE;
    users.set(key, { username: key, balance: balance });
    console.log(`[USER-INIT] Created user ${key} with balance: $${balance}`);
  }
  return users.get(key);
}

function updateUserBalance(username, delta, setBalance = null) {
  const user = getOrCreateUser(username);
  if (setBalance !== null) {
    user.balance = Math.max(0, Number(setBalance));
    console.log(`[BALANCE-SET] ${username} balance set to: $${user.balance}`);
  } else {
    user.balance = Math.max(0, (user.balance || 0) + Number(delta || 0));
    console.log(`[BALANCE-UPDATE] ${username} balance ${delta >= 0 ? '+' : ''}${delta} = $${user.balance}`);
  }
  return user.balance;
}

// Enhanced Dynatrace Metadata Endpoints (similar to BizObs)
app.get('/api/services/metadata', (req, res) => {
  const serviceMetadata = {
    application: 'Vegas-Casino-Microservices',
    version: '2.1.0',
    environment: 'vegas-casino-production',
    cluster: 'vegas-casino-cluster',
    timestamp: new Date().toISOString(),
    services: [
      {
        name: 'vegas-slots-service',
        port: 8081,
        gameType: 'slots-machine',
        complexity: 'high',
        rtp: '96.5%',
        maxPayout: '100x',
        features: ['progressive-jackpot', 'bonus-rounds', 'cheat-detection', 'real-time-metrics'],
        status: childServices['vegas-slots-service'] ? 'running' : 'stopped'
      },
      {
        name: 'vegas-roulette-service',
        port: 8082,
        gameType: 'european-roulette',
        complexity: 'high',
        rtp: '97.3%',
        maxPayout: '36x',
        features: ['multiple-bet-types', 'live-wheel', 'cheat-detection', 'advanced-statistics'],
        status: childServices['vegas-roulette-service'] ? 'running' : 'stopped'
      },
      {
        name: 'vegas-dice-service',
        port: 8083,
        gameType: 'craps-dice',
        complexity: 'medium',
        rtp: '98.6%',
        maxPayout: '2x',
        features: ['dual-dice-roll', 'craps-rules', 'pass-line-betting', 'real-time-results'],
        status: childServices['vegas-dice-service'] ? 'running' : 'stopped'
      },
      {
        name: 'vegas-blackjack-service',
        port: 8084,
        gameType: 'blackjack-21',
        complexity: 'high',
        rtp: '99.5%',
        maxPayout: '2.5x',
        features: ['card-counting-resistant', 'dealer-ai', 'multi-action', 'session-state'],
        status: childServices['vegas-blackjack-service'] ? 'running' : 'stopped'
      }
    ],
    businessContext: {
      industry: 'Gaming',
      businessUnit: 'Digital Casino',
      owner: 'Vegas-Casino-Team',
      criticality: 'high',
      dataClassification: 'internal'
    }
  };
  
  res.json(serviceMetadata);
});

// Service Health Check Endpoint
app.get('/api/services/health', (req, res) => {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    overallStatus: 'healthy',
    services: {}
  };
  
  Object.keys(SERVICE_PORTS).forEach(serviceName => {
    healthStatus.services[serviceName] = {
      status: childServices[serviceName] ? 'running' : 'stopped',
      port: SERVICE_PORTS[serviceName],
      uptime: childServices[serviceName] ? 'active' : 'inactive'
    };
  });
  
  res.json(healthStatus);
});

// User API
app.post('/api/user/init', (req, res) => {
  const username = (req.body && (req.body.Username || req.body.username)) || 'Anonymous';
  const user = getOrCreateUser(username);
  res.json({ username: user.username, balance: user.balance });
});

app.get('/api/user/balance', (req, res) => {
  const username = req.query.username || 'Anonymous';
  const user = getOrCreateUser(username);
  res.json({ username: user.username, balance: user.balance });
});

// Persistent Top-Up endpoint
app.post('/api/user/topup', (req, res) => {
  const username = (req.body && (req.body.Username || req.body.username)) || 'Anonymous';
  const amount = Number((req.body && (req.body.Amount || req.body.amount)) || 500);
  updateUserBalance(username, Math.max(0, amount));
  const user = getOrCreateUser(username);
  // Log BizEvent for top-up action
  logTelemetry('USER_TOPUP', {
    action: 'topup',
    username: user.username,
    amount: amount,
    balance: user.balance,
    correlationId: generateCorrelationId()
  });
  res.json({ username: user.username, balance: user.balance });
});

// Cheat Activity Logging Endpoint
app.post('/api/log-cheat', async (req, res) => {
  try {
    const logEntry = req.body;
    
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, 'vegas-cheat-logs');
    try {
      await mkdir(logsDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error('Error creating logs directory:', err);
      }
    }
    
    // Create filename with date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logFileName = `vegas-cheating-${today}.log`;
    const logFilePath = path.join(logsDir, logFileName);
    
    // Format log entry with flattened structure for OneAgent capture
    const formattedLogEntry = {
      timestamp: logEntry.timestamp,
      level: 'WARN',
      event_type: 'CASINO_CHEATING_ATTEMPT',
      game: logEntry.game,
      action: logEntry.action,
      cheat_type: logEntry.cheatType,
      
      // Flattened player information
      customer_name: logEntry.player.customerName,
      email: logEntry.player.email,
      company_name: logEntry.player.companyName,
      persona: logEntry.player.persona,
      booth: logEntry.player.booth,
      
      // Flattened cheat details
      cheat_name: logEntry.cheatDetails ? logEntry.cheatDetails.name : null,
      cheat_cost: logEntry.cheatDetails ? logEntry.cheatDetails.cost : null,
      cheat_win_boost: logEntry.cheatDetails ? logEntry.cheatDetails.winBoost : null,
      cheat_detection_risk: logEntry.cheatDetails ? logEntry.cheatDetails.detectionRisk : null,
      
      // Flattened session information
      balance: logEntry.sessionInfo.balance,
      total_activations_today: logEntry.sessionInfo.totalActivationsToday,
      current_detection_risk: logEntry.sessionInfo.currentDetectionRisk,
      
      // Flattened game context
      bet_amount: logEntry.gameContext ? logEntry.gameContext.currentBetAmount : null,
      win_amount: logEntry.gameContext ? logEntry.gameContext.lastWinAmount : null,
      last_multiplier: logEntry.gameContext ? logEntry.gameContext.lastMultiplier : null,
      last_result: logEntry.gameContext ? logEntry.gameContext.lastResult : null,
      correlation_id: logEntry.gameContext ? logEntry.gameContext.correlationId : null,
      
      // Flattened consent
      opt_in: logEntry.optInConsent,
      
      // Flattened security information
      severity: logEntry.action === 'activate' ? 'HIGH' : 'MEDIUM',
      category: 'FRAUD_PREVENTION',
      requires_investigation: logEntry.sessionInfo.currentDetectionRisk > 50
    };
    
    // Append to log file
    const logLine = JSON.stringify(formattedLogEntry) + '\n';
    await appendFile(logFilePath, logLine);
    
    console.log(`[CHEAT-LOG] ${logEntry.action} ${logEntry.cheatType} by ${logEntry.player.customerName}`);
    
    res.json({ 
      success: true, 
      message: 'Cheat activity logged successfully',
      logFile: logFileName 
    });
    
  } catch (error) {
    console.error('Error logging cheat activity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to log cheat activity' 
    });
  }
});

// Comprehensive Game Activity Logging with Flattened Structure
async function logGameActivity(game, action, playerData, gameDetails) {
  try {
    const logsDir = path.join(__dirname, 'vegas-cheat-logs');
    
    // Ensure logs directory exists
    try {
      await mkdir(logsDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error('Error creating logs directory:', err);
      }
    }
    
    // Create filename with date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logFileName = `vegas-activity-${today}.log`;
    const logFilePath = path.join(logsDir, logFileName);
    
    // Format comprehensive log entry with all fields flattened to top level
    const logEntry = {
      timestamp: new Date().toISOString(),
      CustomerName: playerData.customerName || playerData.Username || 'Anonymous',
      cheatType: gameDetails.cheatActive ? gameDetails.cheatType : null,
      winAmount: gameDetails.winAmount || 0,
      Balance: gameDetails.balanceAfter || 0,
      CorrelationId: gameDetails.correlationId || generateCorrelationId(),
      DetectionRisk: gameDetails.cheatActive ? 'HIGH' : 'LOW',
      requires_investigation: gameDetails.cheatActive || false,
      BetAmount: gameDetails.betAmount || 0,
      multiplier: gameDetails.multiplier || 0,
      result: gameDetails.result || null,
      
      // Keep additional fields for context
      level: gameDetails.cheatActive ? 'SECURITY_ALERT' : 'INFO',
      event_type: 'CASINO_GAME_ACTIVITY',
      game: game,
      action: action,
      email: playerData.email || '',
      company_name: playerData.companyName || '',
      persona: playerData.persona || '',
      booth: playerData.booth || '',
      balance_before: gameDetails.balanceBefore || 0,
      balance_after: gameDetails.balanceAfter || 0,
      cheat_active: gameDetails.cheatActive || false,
      cheat_type: gameDetails.cheatActive ? gameDetails.cheatType : null,
      cheat_win_boost_applied: gameDetails.cheatActive ? (gameDetails.cheatApplied || false) : false,
      cheat_original_win: gameDetails.cheatActive ? (gameDetails.originalWinAmount || 0) : 0,
      cheat_boosted_win: gameDetails.cheatActive ? (gameDetails.winAmount || 0) : 0,
      correlation_id: gameDetails.correlationId || generateCorrelationId(),
      user_agent: 'Vegas-Casino-Browser',
      ip_address: 'internal',
      
      // Flattened consent
      opt_in: playerData.optIn || false,
      
      // Flattened security information
      severity: gameDetails.cheatActive ? 'HIGH' : 'LOW',
      category: gameDetails.cheatActive ? 'FRAUD_DETECTION' : 'GAME_ACTIVITY',
      requires_investigation: gameDetails.cheatActive || false
    };
    
    // Append to log file
    const logLine = JSON.stringify(logEntry) + '\n';
    await appendFile(logFilePath, logLine);
    
    // Log clean JSON to console for OneAgent (no prefix for clean parsing)
    console.log(JSON.stringify(logEntry));
    
    // Simple console logging for visibility
    console.log(`[GAME-LOG] ${game.toUpperCase()}: ${action} by ${playerData.customerName || playerData.Username} - Bet: $${gameDetails.betAmount || 0}, Win: $${gameDetails.winAmount || 0}`);
    
  } catch (error) {
    console.error('Error logging game activity:', error);
  }
}

// Helper to call child service and parse JSON
function callChildJson(targetPort, pathName, payload) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: targetPort,
      path: pathName,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    const req2 = http.request(options, (res2) => {
      let body = '';
      res2.setEncoding('utf8');
      res2.on('data', chunk => body += chunk);
      res2.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve(json);
        } catch (e) {
          reject(new Error(`Invalid JSON from child service on port ${targetPort}: ${e.message}`));
        }
      });
    });
    req2.on('error', reject);
    req2.end(JSON.stringify(payload || {}));
  });
}

// Game configuration
const GAME_CONFIG = {
  slots: {
    icons: [
      // Premium Dynatrace Symbols (Highest Payouts)
      'dynatrace', 'smartscape', 'application', 'database',
      // Technology Symbols (High Payouts)  
      'server', 'cloud', 'shield', 'chart', 'network',
      // Service Symbols (Medium Payouts)
      'services', 'host', 'process', 'memory', 'cpu'
    ],
    multipliers: { 3: 5, 2: 2 },
    baseWinChance: 0.15,
    // Enhanced payout system
    payouts: {
      triple: {
        'dynatrace': 100, 'smartscape': 50, 'application': 25, 'database': 20,
        'server': 15, 'cloud': 12, 'shield': 10, 'chart': 8, 'network': 6,
        'services': 4, 'host': 3, 'process': 2, 'memory': 2, 'cpu': 2
      },
      double: {
        'dynatrace': 10, 'smartscape': 5, 'application': 3, 'database': 2,
        'server': 2, 'cloud': 1.5, 'shield': 1.5, 'chart': 1.2, 'network': 1.2,
        'services': 1, 'host': 1, 'process': 0.5, 'memory': 0.5, 'cpu': 0.5
      }
    }
  },
  roulette: {
    numbers: Array.from({ length: 37 }, (_, i) => i), // 0-36
    colors: { red: [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36], black: [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35] },
    payouts: { straight: 35, split: 17, street: 11, corner: 8, sixline: 5, column: 2, dozen: 2, evenodd: 1, redblack: 1, highlow: 1 }
  },
  dice: {
    sides: 6,
    combinations: {
      snake_eyes: { dice: [1, 1], multiplier: 30 },
      boxcars: { dice: [6, 6], multiplier: 30 },
      hard_eight: { dice: [4, 4], multiplier: 9 },
      hard_six: { dice: [3, 3], multiplier: 9 },
      seven_out: { sum: 7, multiplier: 4 }
    }
  },
  blackjack: {
    deck: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
    suits: ['hearts', 'diamonds', 'clubs', 'spades'],
    blackjackPayout: 1.5,
    insurancePayout: 2
  }
};

// Telemetry storage
let gameMetrics = {
  totalSpins: 0,
  totalWins: 0,
  totalLosses: 0,
  totalRevenue: 0,
  totalPayout: 0,
  activeUsers: 0,
  gamesPlayed: { slots: 0, roulette: 0, dice: 0, blackjack: 0 },
  averageSessionTime: 0,
  errors: [],
  systemHealth: {
    cpu: 0,
    memory: 0,
    latency: 0,
    uptime: 0
  }
};

// User sessions for tracking
const userSessions = new Map();

// Dynatrace Configuration
// Configuration
const PORT = process.env.PORT || 8080;
const DYNATRACE_CONFIG = {
  environment: process.env.DT_ENVIRONMENT || 'sprint-labs',
  serviceVersion: '2.0.0',
  serviceName: 'dynatrace-vegas-casino',
  ingestEndpoint: process.env.DT_INGEST_ENDPOINT,
  apiToken: process.env.DT_API_TOKEN,
  // Enhanced service detection tags
  serviceTags: {
    'dt.service.name': 'dynatrace-vegas-casino',
    'dt.service.version': '2.0.0',
    'dt.service.environment': 'sprint-labs'
  }
};

// Service Identification for Dynatrace
const SERVICE_NAMES = {
  casino: 'vegas-casino-main',
  slots: 'vegas-slots-service',
  roulette: 'vegas-roulette-service',
  dice: 'vegas-dice-service',
  blackjack: 'vegas-blackjack-service',
  analytics: 'vegas-analytics-service',
  leaderboard: 'vegas-leaderboard-service'
};

// Utility functions
function generateCorrelationId() {
  return crypto.randomBytes(8).toString('hex');
}

// Slots game logic
function spinSlots(betAmount) {
  return new Promise((resolve) => {
    // Generate slot result
    const result = Array.from({ length: 3 }, () => 
      GAME_CONFIG.slots.icons[Math.floor(Math.random() * GAME_CONFIG.slots.icons.length)]
    );
    
    // Enhanced win calculation
    const symbolCounts = {};
    result.forEach(symbol => {
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });
    
    let isWin = false;
    let multiplier = 0;
    let winType = '';
    
    // Check for triple matches first (highest priority)
    for (const [symbol, count] of Object.entries(symbolCounts)) {
      if (count === 3) {
        multiplier = GAME_CONFIG.slots.payouts.triple[symbol] || 2;
        isWin = true;
        winType = 'triple';
        break;
      }
    }
    
    // If no triple, check for double matches
    if (!isWin) {
      for (const [symbol, count] of Object.entries(symbolCounts)) {
        if (count === 2) {
          multiplier = GAME_CONFIG.slots.payouts.double[symbol] || 1;
          isWin = true;
          winType = 'double';
          break;
        }
      }
    }
    
    const winAmount = isWin ? betAmount * multiplier : 0;
    
    const responseData = {
      result,
      win: isWin,
      winAmount,
      betAmount,
      multiplier: isWin ? multiplier : 0,
      winType,
      correlationId: generateCorrelationId(),
      timestamp: new Date().toISOString()
    };
    
    resolve(responseData);
  });
}

// Dynatrace BizEvents payload builder
function createBizEvent(eventType, data) {
  const serviceName = data.service || SERVICE_NAMES.casino;
  
  // Extract Vegas Casino specific data for rqBody
  const vegasCasinoData = { ...data };
  delete vegasCasinoData.service; // Remove service from the payload
  
  const baseEvent = {
    specversion: '1.0',
    type: `com.dynatrace.vegas.${eventType}`,
    source: serviceName,
    id: generateCorrelationId(),
    time: new Date().toISOString(),
    dt: {
      entity: {
        type: 'SERVICE',
        name: serviceName
      },
      trace_id: generateCorrelationId(),
      span_id: generateCorrelationId()
    },
    data: {
      casino: 'Dynatrace Vegas',
      environment: DYNATRACE_CONFIG.environment,
      service: serviceName,
      // Put the actual Vegas Casino game data in rqBody
      rqBody: vegasCasinoData
    }
  };
  
  return baseEvent;
}

// Send BizEvent to Dynatrace
function sendBizEvent(eventType, data) {
  const bizEvent = createBizEvent(eventType, data);
  
  // Log BizEvent for debugging
  console.log(`📊 BizEvent [${eventType}]:`, JSON.stringify(bizEvent, null, 2));
  
  // In a real implementation, send to Dynatrace Ingest API
  if (DYNATRACE_CONFIG.ingestEndpoint && DYNATRACE_CONFIG.apiToken) {
    // TODO: Implement actual HTTP POST to Dynatrace Ingest API
    // fetch(DYNATRACE_CONFIG.ingestEndpoint + '/v1/events/ingest', { ... })
  }
  
  return bizEvent;
}

function logTelemetry(event, data) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${event}:`, JSON.stringify(data, null, 2));
  
  // Send corresponding BizEvent to Dynatrace
  if (event.includes('GAME_') || event.includes('USER_') || event.includes('SPIN') || event.includes('DEAL')) {
    const eventType = event.toLowerCase().replace('_', '.');
    const serviceName = getServiceNameFromEvent(event, data);
    
    sendBizEvent(eventType, {
      ...data,
      telemetryEvent: event,
      timestamp,
      service: serviceName
    });
  }
  
  // No SDK metrics; BizEvents come from request body capture on /api/* endpoints
  
  // Update metrics
  gameMetrics.totalSpins += data.action === 'spin' ? 1 : 0;
  gameMetrics.totalWins += data.win ? 1 : 0;
  gameMetrics.totalLosses += !data.win && data.action === 'spin' ? 1 : 0;
  gameMetrics.totalRevenue += data.betAmount || 0;
  gameMetrics.totalPayout += data.winAmount || 0;
  
  if (data.game) {
    gameMetrics.gamesPlayed[data.game.toLowerCase()] = (gameMetrics.gamesPlayed[data.game.toLowerCase()] || 0) + 1;
  }
  
  if (data.error) {
    gameMetrics.errors.push({
      timestamp,
      error: data.error,
      correlationId: data.correlationId
    });
    
    // Keep only last 100 errors
    if (gameMetrics.errors.length > 100) {
      gameMetrics.errors = gameMetrics.errors.slice(-100);
    }
  }
}

// Helper function to determine service name from event
function getServiceNameFromEvent(event, data) {
  if (event.includes('SLOTS') || data.game === 'Slots') return SERVICE_NAMES.slots;
  if (event.includes('ROULETTE') || data.game === 'Roulette') return SERVICE_NAMES.roulette;
  if (event.includes('DICE') || data.game === 'Dice') return SERVICE_NAMES.dice;
  if (event.includes('BLACKJACK') || data.game === 'Blackjack') return SERVICE_NAMES.blackjack;
  if (event.includes('LEADERBOARD')) return SERVICE_NAMES.leaderboard;
  if (event.includes('METRICS')) return SERVICE_NAMES.analytics;
  return SERVICE_NAMES.casino;
}

// Dynatrace middleware for service identification
function dynatraceMiddleware(serviceName) {
  return (req, res, next) => {
    // Enhanced Dynatrace headers for proper service separation
    res.setHeader('X-Dynatrace-Service', serviceName);
    res.setHeader('X-Dynatrace-Version', DYNATRACE_CONFIG.serviceVersion);
    res.setHeader('X-Dynatrace-Environment', DYNATRACE_CONFIG.environment);
    res.setHeader('X-Service-Instance', `${serviceName}-${process.pid}`);
    
    // Critical: Set different service detection per endpoint
    res.setHeader('X-dynaTrace-PC', serviceName); // Process Name Component
    res.setHeader('X-dynaTrace-PG', `${serviceName}-group`); // Process Group
    res.setHeader('dt-logicalServiceName', serviceName); // Logical Service Name
    
    // No SDK attributes; rely on OneAgent auto-instrumentation
    
    // Log request for tracing
    const correlationId = generateCorrelationId();
    req.correlationId = correlationId;
    req.serviceName = serviceName;
    
    logTelemetry('HTTP_REQUEST', {
      method: req.method,
      path: req.path,
      service: serviceName,
      correlationId,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      serviceInstance: `${serviceName}-${process.pid}`
    });
    
    next();
  };
}

// Simulate system metrics
function simulateSystemMetrics() {
  gameMetrics.systemHealth.cpu = Math.floor(Math.random() * 100);
  gameMetrics.systemHealth.memory = Math.floor(Math.random() * 100);
  gameMetrics.systemHealth.latency = Math.floor(Math.random() * 200) + 50;
  gameMetrics.systemHealth.uptime = process.uptime();
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  gameMetrics.activeUsers++;
  
  // Send initial metrics
  socket.emit('metrics-update', gameMetrics);
  
  // Handle user session tracking
  socket.on('user-login', (userData) => {
    userSessions.set(socket.id, {
      username: userData.username,
      loginTime: Date.now(),
      gamesPlayed: 0,
      totalWagered: 0
    });
    
    logTelemetry('USER_LOGIN', {
      username: userData.username,
      socketId: socket.id,
      correlationId: generateCorrelationId()
    });
  });
  
  // Handle game events
  socket.on('game-action', (gameData) => {
    const correlationId = generateCorrelationId();
    const session = userSessions.get(socket.id);
    
    if (session) {
      session.gamesPlayed++;
      session.totalWagered += gameData.betAmount || 0;
    }
    
    logTelemetry('GAME_ACTION', {
      ...gameData,
      socketId: socket.id,
      username: session?.username || 'Anonymous',
      correlationId
    });
    
    // Broadcast metrics update to all connected clients
    io.emit('metrics-update', gameMetrics);
  });
  
  // Handle slots spin events
  socket.on('slots-spin', async (data) => {
    try {
      const { betAmount, username } = data;
      const correlationId = generateCorrelationId();
      
      // Call the slots API logic
      const slotsResult = await spinSlots(betAmount);
      
      // Update session data
      let session = userSessions.get(socket.id);
      if (!session) {
        session = {
          username: username || 'Anonymous',
          balance: 1000,
          gamesPlayed: 0,
          totalWagered: 0
        };
        userSessions.set(socket.id, session);
      }
      
      // Update session with spin results
      session.gamesPlayed++;
      session.totalWagered += betAmount;
      session.balance += (slotsResult.winAmount - betAmount); // Add winnings, subtract bet
      
      // Ensure balance doesn't go negative
      if (session.balance < 0) session.balance = 0;
      
      // Log telemetry
      logTelemetry('SLOTS_SPIN', {
        betAmount,
        result: slotsResult.result,
        win: slotsResult.win,
        winAmount: slotsResult.winAmount,
        socketId: socket.id,
        username: session.username,
        correlationId
      });
      
      // Send result back to the client with consistent field names
      socket.emit('slots-result', {
        symbols: slotsResult.result,
        result: slotsResult.result,
        multiplier: slotsResult.multiplier,
        winAmount: slotsResult.winAmount,
        winnings: slotsResult.winAmount, // Keep both for compatibility
        betAmount: betAmount,
        newBalance: session.balance,
        correlationId: correlationId
      });
      
      // Update global metrics
      gameMetrics.totalWagers += betAmount;
      if (slotsResult.win) {
        gameMetrics.totalPayouts += slotsResult.winAmount;
      }
      
      // Broadcast metrics update
      io.emit('metrics-update', gameMetrics);
      
    } catch (error) {
      console.error('Slots spin error:', error);
      socket.emit('slots-error', { message: 'Spin failed. Please try again.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
    gameMetrics.activeUsers = Math.max(0, gameMetrics.activeUsers - 1);
    
    const session = userSessions.get(socket.id);
    if (session) {
      const sessionTime = (Date.now() - session.loginTime) / 1000 / 60; // minutes
      gameMetrics.averageSessionTime = (gameMetrics.averageSessionTime + sessionTime) / 2;
      
      logTelemetry('USER_LOGOUT', {
        username: session.username,
        sessionTime,
        gamesPlayed: session.gamesPlayed,
        totalWagered: session.totalWagered,
        correlationId: generateCorrelationId()
      });
      
      userSessions.delete(socket.id);
    }
    
    io.emit('metrics-update', gameMetrics);
  });
});

// API Routes

/**
 * Metrics endpoint - Returns comprehensive telemetry data
 */
app.get('/api/metrics', dynatraceMiddleware(SERVICE_NAMES.analytics), (req, res) => {
  simulateSystemMetrics();
  
  const metricsData = {
    ...gameMetrics,
    timestamp: new Date().toISOString(),
    correlationId: generateCorrelationId()
  };
  
  res.json(metricsData);
});

/**
 * BizEvent capture endpoint - accepts completed game events with resolved outcomes
 * OneAgent can capture this request body as Business Events with full fields.
 */
app.post('/api/bizevent', dynatraceMiddleware(SERVICE_NAMES.analytics), (req, res) => {
  try {
    const payload = req.body || {};
    // Log minimal telemetry and forward as BizEvent structure for visibility
    logTelemetry('BIZEVENT_COMPLETED', {
      action: payload.Action || 'Completed',
      game: payload.Game || 'Vegas',
      username: payload.Username || 'Anonymous',
      correlationId: payload.CorrelationId,
      win: Boolean(payload.WinFlag),
      winAmount: Number(payload.WinningAmount || 0),
      lossAmount: Number(payload.LossAmount || 0)
    });
  } catch (e) {
    // ignore errors; this is best-effort
  }
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

/**
 * Metrics Route (Alternative endpoint for lobby compatibility)
 */
app.get('/metrics', dynatraceMiddleware(SERVICE_NAMES.analytics), (req, res) => {
  simulateSystemMetrics();
  
  const metricsData = {
    ...gameMetrics,
    timestamp: new Date().toISOString(),
    correlationId: generateCorrelationId()
  };
  
  res.json(metricsData);
});

/**
 * Slots API - Receives bizevent payload directly in request body for OneAgent capture
 */
// Proxy: Slots
app.post('/api/slots/spin', dynatraceMiddleware(SERVICE_NAMES.slots), async (req, res) => {
  try {
    startChildService(SERVICE_NAMES.slots, path.join('services','slots-service.js'));
    const Username = (req.body && (req.body.Username || req.body.userId || req.body.username)) || 'Anonymous';
    const BetAmount = Number((req.body && (req.body.BetAmount ?? req.body.betAmount)) || 10);
    
    // Extract balance from frontend request (use originalBalance if available, otherwise balance)
    const frontendBalance = req.body.balance || req.body.Balance || null;
    const frontendNewBalance = req.body.newBalance || null;
    
    console.log('[SLOTS-SPIN] Request data:', {
      Username,
      BetAmount,
      frontendBalance,
      frontendNewBalance,
      'req.body.balance': req.body.balance,
      'req.body.newBalance': req.body.newBalance
    });
    
    // Extract cheating information
    const CheatActive = req.body.CheatActive || false;
    const CheatType = req.body.CheatType || null;
    const CheatDetails = req.body.CheatDetails || null;

    // Use frontend balance if provided, otherwise create with default
    const user = getOrCreateUser(Username, frontendBalance);
    
    // Sync server balance with frontend if frontend provided a balance
    if (frontendBalance !== null && user.balance !== frontendBalance) {
      console.log(`[BALANCE-SYNC] Syncing ${Username} balance from server:$${user.balance} to frontend:$${frontendBalance}`);
      updateUserBalance(Username, 0, frontendBalance); // Set balance to frontend value
    }
    
    const balanceBefore = user.balance;
    
    if (user.balance < BetAmount) return res.status(400).json({ error: 'Insufficient balance', balance: user.balance });
    
    // Deduct bet
    updateUserBalance(Username, -BetAmount);
    const payload = { ...req.body, Username, BetAmount, Balance: users.get(Username).balance };
    const data = await callChildJson(SERVICE_PORTS[SERVICE_NAMES.slots], '/spin', payload);
    
    let winAmount = Number(data.winAmount || 0);
    let originalWinAmount = winAmount;
    let cheatApplied = false;
    
    // Apply cheating boost if active
    if (CheatActive && CheatDetails && winAmount > 0) {
      const winBoost = CheatDetails.winBoost || 0;
      winAmount = Math.floor(winAmount * (1 + winBoost));
      cheatApplied = true;
      
      console.log(`[CHEAT-BOOST] ${CheatType}: Original win $${originalWinAmount} -> Boosted to $${winAmount} (+${Math.round(winBoost * 100)}%)`);
      
      // Update the response data to reflect the cheated win
      data.winAmount = winAmount;
      data.cheatApplied = true;
      data.originalWinAmount = originalWinAmount;
      data.winBoost = winBoost;
    }
    
    if (winAmount > 0) updateUserBalance(Username, winAmount);
    
    const balanceAfter = users.get(Username).balance;
    
    // Log comprehensive game activity
    await logGameActivity('slots', 'spin', {
      customerName: req.body.CustomerName,
      Username: Username,
      email: req.body.Email,
      companyName: req.body.CompanyName,
      persona: req.body.Persona,
      booth: req.body.Booth,
      optIn: req.body.OptIn
    }, {
      betAmount: BetAmount,
      winAmount: winAmount,
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      result: data.result,
      multiplier: data.multiplier,
      cheatActive: CheatActive,
      cheatType: CheatType,
      cheatApplied: cheatApplied,
      originalWinAmount: originalWinAmount,
      correlationId: req.body.CorrelationId
    });
    
    // Automatic lockout on high-risk cheating patterns
    if (CheatActive && cheatApplied && winAmount > 2000) {
      const riskScore = (req.body.DetectionRisk || 0) + (req.body.CheatActivationsToday || 0) * 5;
      
      if (riskScore > 50) {
        userLockouts.set(Username, {
          locked: true,
          reason: `High-risk cheating detected (Risk: ${riskScore})`,
          timestamp: new Date().toISOString(),
          duration: 30 // 30 minute lockout
        });
        
        console.log(`🚨 [AUTO-LOCKOUT] User ${Username} automatically locked for high-risk cheating (Risk: ${riskScore})`);
      }
    }
    
    // Include complete analytics data in response body for OneAgent capture
    res.json({ 
      ...data, 
      newBalance: users.get(Username).balance, 
      Username,
      // Complete user profile data
      CustomerName: req.body.CustomerName,
      Email: req.body.Email,
      CompanyName: req.body.CompanyName,
      Persona: req.body.Persona,
      Booth: req.body.Booth,
      OptIn: req.body.OptIn,
      // Game analytics data
      Game: 'Vegas Slots Machine',
      BetAmount: BetAmount,
      WinFlag: winAmount > 0 ? 1 : 0,
      WinningAmount: winAmount,
      LossAmount: winAmount > 0 ? 0 : BetAmount,
      Balance: users.get(Username).balance,
      Action: 'SpinCompleted',
      Device: 'Browser-UI',
      CorrelationId: req.body.CorrelationId,
      Status: 'Completed',
      // Cheat detection data
      CheatActive: CheatActive,
      CheatType: CheatType,
      CheatDetails: CheatDetails,
      DetectionRisk: req.body.DetectionRisk,
      CheatActivationsToday: req.body.CheatActivationsToday,
      // Jackpot detection (wins >= $1000)
      JackpotFlag: winAmount >= 1000 ? 1 : 0
    });
  } catch (e) {
    res.status(502).json({ error: 'Service unavailable', details: e.message });
  }
});

/**
 * Roulette API - Receives bizevent payload directly in request body for OneAgent capture
 */
// Proxy: Roulette
app.post('/api/roulette/spin', dynatraceMiddleware(SERVICE_NAMES.roulette), async (req, res) => {
  try {
    startChildService(SERVICE_NAMES.roulette, path.join('services','roulette-service.js'));
    const Username = (req.body && (req.body.Username || req.body.userId || req.body.username)) || 'Anonymous';
    const BetAmount = Number((req.body && (req.body.BetAmount ?? req.body.betAmount)) || 10);
    
    // Extract balance from frontend request
    const frontendBalance = req.body.balance || req.body.Balance || null;
    console.log('[ROULETTE-SPIN] Request data:', { Username, BetAmount, frontendBalance });
    
    // Use frontend balance if provided
    const user = getOrCreateUser(Username, frontendBalance);
    
    // Sync server balance with frontend if provided
    if (frontendBalance !== null && user.balance !== frontendBalance) {
      console.log(`[BALANCE-SYNC] Syncing ${Username} roulette balance from server:$${user.balance} to frontend:$${frontendBalance}`);
      updateUserBalance(Username, 0, frontendBalance);
    }
    
    const balanceBefore = user.balance;
    
    if (user.balance < BetAmount) return res.status(400).json({ error: 'Insufficient balance', balance: user.balance });
    updateUserBalance(Username, -BetAmount);
    const payload = { ...req.body, Username, BetAmount, Balance: users.get(Username).balance };
    const data = await callChildJson(SERVICE_PORTS[SERVICE_NAMES.roulette], '/spin', payload);
    const payout = Number(data.payout || 0);
    if (payout > 0) updateUserBalance(Username, payout);
    
    const balanceAfter = users.get(Username).balance;
    const CheatActive = req.body.CheatActive === true;
    const CheatType = req.body.CheatType || null;
    const CheatDetails = req.body.CheatDetails || null;
    
    // Log roulette activity with enhanced cheat detection
    await logGameActivity('roulette', 'spin', {
      customerName: req.body.CustomerName,
      Username: Username,
      email: req.body.Email,
      companyName: req.body.CompanyName,
      persona: req.body.Persona,
      booth: req.body.Booth,
      optIn: req.body.OptIn,
      cheatDetails: CheatDetails
    }, {
      betAmount: BetAmount,
      winAmount: payout,
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      result: data.result || data.number,
      multiplier: data.multiplier || 0,
      cheatActive: CheatActive,
      cheatType: CheatType,
      correlationId: req.body.CorrelationId
    });
    
    // Include complete analytics data in response body for OneAgent capture
    res.json({ 
      ...data, 
      newBalance: users.get(Username).balance, 
      Username,
      // Complete user profile data
      CustomerName: req.body.CustomerName,
      Email: req.body.Email,
      CompanyName: req.body.CompanyName,
      Persona: req.body.Persona,
      Booth: req.body.Booth,
      OptIn: req.body.OptIn,
      // Game analytics data
      Game: 'Vegas Roulette',
      BetAmount: BetAmount,
      WinFlag: payout > 0 ? 1 : 0,
      WinningAmount: payout,
      LossAmount: payout > 0 ? 0 : BetAmount,
      Balance: users.get(Username).balance,
      Action: 'SpinCompleted',
      Device: 'Browser-UI',
      CorrelationId: req.body.CorrelationId,
      Status: 'Completed',
      // Game-specific data
      BetType: req.body.BetType,
      BetValue: req.body.BetValue
    });
  } catch (e) {
    res.status(502).json({ error: 'Service unavailable', details: e.message });
  }
});

/**
 * Dice API - Receives bizevent payload directly in request body for OneAgent capture
 */
// Proxy: Dice
app.post('/api/dice/roll', dynatraceMiddleware(SERVICE_NAMES.dice), async (req, res) => {
  try {
    startChildService(SERVICE_NAMES.dice, path.join('services','dice-service.js'));
    const Username = (req.body && (req.body.Username || req.body.userId || req.body.username)) || 'Anonymous';
    const BetAmount = Number((req.body && (req.body.BetAmount ?? req.body.betAmount)) || 10);
    
    // Extract balance from frontend request
    const frontendBalance = req.body.balance || req.body.Balance || null;
    console.log('[DICE-ROLL] Request data:', { Username, BetAmount, frontendBalance });
    
    // Use frontend balance if provided
    const user = getOrCreateUser(Username, frontendBalance);
    
    // Sync server balance with frontend if provided
    if (frontendBalance !== null && user.balance !== frontendBalance) {
      console.log(`[BALANCE-SYNC] Syncing ${Username} dice balance from server:$${user.balance} to frontend:$${frontendBalance}`);
      updateUserBalance(Username, 0, frontendBalance);
    }
    
    const balanceBefore = user.balance;
    
    if (user.balance < BetAmount) return res.status(400).json({ error: 'Insufficient balance', balance: user.balance });
    updateUserBalance(Username, -BetAmount);
    const payload = { ...req.body, Username, BetAmount, Balance: users.get(Username).balance };
    const data = await callChildJson(SERVICE_PORTS[SERVICE_NAMES.dice], '/roll', payload);
    
    // Use cheat payout if provided (client-side cheat system override)
    const cheatPayout = Number(req.body.CheatPayout || 0);
    const payout = cheatPayout > 0 ? cheatPayout : Number(data.payout || 0);
    
    if (payout > 0) updateUserBalance(Username, payout);
    
    console.log(`🎲 Dice payout: server=${data.payout}, cheat=${cheatPayout}, final=${payout}`);
    
    const balanceAfter = users.get(Username).balance;
    
    const CheatActive = req.body.CheatActive === true;
    const CheatType = req.body.CheatType || null;
    const CheatDetails = req.body.CheatDetails || null;
    
    // Log dice activity with enhanced cheat detection
    await logGameActivity('dice', 'roll', {
      customerName: req.body.CustomerName,
      Username: Username,
      email: req.body.Email,
      companyName: req.body.CompanyName,
      persona: req.body.Persona,
      booth: req.body.Booth,
      optIn: req.body.OptIn,
      cheatDetails: CheatDetails
    }, {
      betAmount: BetAmount,
      winAmount: payout,
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      result: data.result || data.dice,
      multiplier: data.multiplier || 0,
      cheatActive: CheatActive,
      cheatType: CheatType,
      correlationId: req.body.CorrelationId
    }, req);
    
    // Include complete analytics data in response body for OneAgent capture
    res.json({ 
      ...data, 
      newBalance: users.get(Username).balance, 
      Username,
      // Complete user profile data
      CustomerName: req.body.CustomerName,
      Email: req.body.Email,
      CompanyName: req.body.CompanyName,
      Persona: req.body.Persona,
      Booth: req.body.Booth,
      OptIn: req.body.OptIn,
      // Game analytics data
      Game: 'Vegas Dice',
      BetAmount: BetAmount,
      WinFlag: payout > 0 ? 1 : 0,
      WinningAmount: payout,
      LossAmount: payout > 0 ? 0 : BetAmount,
      Balance: users.get(Username).balance,
      Action: 'RollCompleted',
      Device: 'Browser-UI',
      CorrelationId: req.body.CorrelationId,
      Status: 'Completed',
      // Game-specific data
      BetType: req.body.BetType
    });
  } catch (e) {
    res.status(502).json({ error: 'Service unavailable', details: e.message });
  }
});

/**
 * Blackjack API - Receives bizevent payload directly in request body for OneAgent capture
 */
// Proxy: Blackjack
app.post('/api/blackjack/deal', dynatraceMiddleware(SERVICE_NAMES.blackjack), async (req, res) => {
  try {
    startChildService(SERVICE_NAMES.blackjack, path.join('services','blackjack-service.js'));
    const Username = (req.body && (req.body.Username || req.body.userId || req.body.username)) || 'Anonymous';
    const BetAmount = Number((req.body && req.body.BetAmount) || 10);
    
    // Extract balance from frontend request
    const frontendBalance = req.body.balance || req.body.Balance || null;
    console.log('[BLACKJACK-DEAL] Request data:', { Username, BetAmount, frontendBalance });
    
    // Use frontend balance if provided
    const user = getOrCreateUser(Username, frontendBalance);
    
    // Sync server balance with frontend if provided
    if (frontendBalance !== null && user.balance !== frontendBalance) {
      console.log(`[BALANCE-SYNC] Syncing ${Username} blackjack balance from server:$${user.balance} to frontend:$${frontendBalance}`);
      updateUserBalance(Username, 0, frontendBalance);
    }
    
    const balanceBefore = user.balance;
    
    if (user.balance < BetAmount) return res.status(400).json({ error: 'Insufficient balance', balance: user.balance });
    updateUserBalance(Username, -BetAmount);
    const payload = { ...req.body, Username, BetAmount, Balance: users.get(Username).balance };
    const data = await callChildJson(SERVICE_PORTS[SERVICE_NAMES.blackjack], '/deal', payload);
    
    const balanceAfter = users.get(Username).balance;
    
    const CheatActive = req.body.CheatActive === true;
    const CheatType = req.body.CheatType || null;
    const CheatDetails = req.body.CheatDetails || null;
    
    // Log blackjack deal activity with enhanced cheat detection
    await logGameActivity('blackjack', 'deal', {
      customerName: req.body.CustomerName,
      Username: Username,
      email: req.body.Email,
      companyName: req.body.CompanyName,
      persona: req.body.Persona,
      booth: req.body.Booth,
      optIn: req.body.OptIn,
      cheatDetails: CheatDetails
    }, {
      betAmount: BetAmount,
      winAmount: 0, // No payout on deal
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      result: data.playerCards || 'cards dealt',
      multiplier: 0,
      cheatActive: CheatActive,
      cheatType: CheatType,
      correlationId: req.body.CorrelationId
    }, req);
    
    // For now, no automatic payout on deal; following actions (not yet proxied) would adjust
    res.json({ ...data, newBalance: users.get(Username).balance, Username });
  } catch (e) {
    res.status(502).json({ error: 'Service unavailable', details: e.message });
  }
});

// Game state storage for blackjack (in production, use Redis or database)
const blackjackGames = new Map();

// Blackjack helper functions
function calculateBlackjackScore(hand) {
  let score = 0;
  let aces = 0;
  
  for (let card of hand) {
    const value = parseInt(card.value);
    if (value === 1) {
      aces++;
      score += 11;
    } else if (value > 10) {
      score += 10;
    } else {
      score += value;
    }
  }
  
  // Adjust for aces
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}

/**
 * Blackjack Hit API - Player takes additional card
 */
app.post('/api/blackjack/hit', dynatraceMiddleware(SERVICE_NAMES.blackjack), (req, res) => {
  startChildService(SERVICE_NAMES.blackjack, path.join('services','blackjack-service.js'));
  proxyJson(SERVICE_PORTS[SERVICE_NAMES.blackjack], req, res);
});

/**
 * Blackjack Stand API - Player stands, dealer plays
 */
app.post('/api/blackjack/stand', dynatraceMiddleware(SERVICE_NAMES.blackjack), (req, res) => {
  startChildService(SERVICE_NAMES.blackjack, path.join('services','blackjack-service.js'));
  // Proxy then adjust balance based on result
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const payload = body ? JSON.parse(body) : {};
      const Username = (payload && (payload.Username || payload.username)) || 'Anonymous';
      const data = await callChildJson(SERVICE_PORTS[SERVICE_NAMES.blackjack], '/stand', payload);
      const payout = Number(data.payout || 0);
      if (payout > 0) updateUserBalance(Username, payout);
      
      // Include complete analytics data in response body for OneAgent capture
      res.json({ 
        ...data, 
        newBalance: users.get(Username).balance, 
        Username,
        // Complete user profile data
        CustomerName: payload.CustomerName,
        Email: payload.Email,
        CompanyName: payload.CompanyName,
        Persona: payload.Persona,
        Booth: payload.Booth,
        OptIn: payload.OptIn,
        // Game analytics data
        Game: 'Vegas Blackjack',
        BetAmount: payload.BetAmount,
        WinFlag: payout > 0 ? 1 : 0,
        WinningAmount: payout,
        LossAmount: (data.result === 'win' || data.result === 'blackjack') ? 0 : (data.result === 'push' ? 0 : payload.BetAmount),
        Balance: users.get(Username).balance,
        Action: 'HandCompleted',
        Device: 'Browser-UI',
        CorrelationId: payload.CorrelationId,
        Status: 'Completed',
        // Game-specific data
        HandType: data.result || 'unknown'
      });
    } catch (e) {
      res.status(502).json({ error: 'Service unavailable', details: e.message });
    }
  });
});

/**
 * Blackjack Double API - Player doubles down
 */
app.post('/api/blackjack/double', dynatraceMiddleware(SERVICE_NAMES.blackjack), (req, res) => {
  startChildService(SERVICE_NAMES.blackjack, path.join('services','blackjack-service.js'));
  // Proxy then deduct additional bet and return updated balance
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const payload = body ? JSON.parse(body) : {};
      const Username = (payload && (payload.Username || payload.username)) || 'Anonymous';
      const data = await callChildJson(SERVICE_PORTS[SERVICE_NAMES.blackjack], '/double', payload);
      const additional = Number(data.additionalBet || 0);
      if (additional > 0) {
        const user = getOrCreateUser(Username);
        if (user.balance < additional) {
          return res.status(400).json({ error: 'Insufficient balance to double', balance: user.balance });
        }
        updateUserBalance(Username, -additional);
      }
      res.json({ ...data, newBalance: users.get(Username).balance, Username });
    } catch (e) {
      res.status(502).json({ error: 'Service unavailable', details: e.message });
    }
  });
});

/**
 * Blackjack Action Logging API - For logging UI actions and game events
 */
app.post('/api/blackjack/action', dynatraceMiddleware(SERVICE_NAMES.blackjack), async (req, res) => {
  try {
    const {
      timestamp,
      game,
      action,
      player,
      email,
      company,
      persona,
      booth,
      balance,
      currentBet,
      ...additionalData
    } = req.body;

    // Create comprehensive log entry
    const logEntry = {
      timestamp,
      service: 'vegas-blackjack-ui',
      action,
      player,
      email,
      company,
      persona,
      booth,
      currentBalance: balance,
      betAmount: currentBet,
      gameData: additionalData,
      userAgent: req.headers['user-agent'] || 'Unknown',
      ip: req.ip || req.connection.remoteAddress
    };

    // Log to vegas-cheat-logs directory
    await logGameActivity('blackjack', action, logEntry);

    // Send telemetry for Dynatrace
    logTelemetry('BLACKJACK_UI_ACTION', {
      action,
      player,
      balance,
      currentBet,
      ...additionalData
    });

    res.json({
      success: true,
      message: 'Blackjack action logged successfully',
      correlationId: generateCorrelationId()
    });

  } catch (error) {
    console.error('❌ Error logging blackjack action:', error);
    res.status(500).json({
      error: 'Failed to log blackjack action',
      details: error.message
    });
  }
});

/**
 * Leaderboard API - Returns top players
 */
app.get('/api/leaderboard', dynatraceMiddleware(SERVICE_NAMES.leaderboard), (req, res) => {
  const correlationId = generateCorrelationId();
  
  // Simulate leaderboard data
  const leaderboard = [
    { username: 'DynaTrader', totalWins: 1250, totalWagered: 15000, winRate: 0.83 },
    { username: 'ObservabilityKing', totalWins: 980, totalWagered: 12500, winRate: 0.78 },
    { username: 'MetricMaster', totalWins: 875, totalWagered: 11200, winRate: 0.78 },
    { username: 'TelemetryPro', totalWins: 750, totalWagered: 9800, winRate: 0.77 },
    { username: 'TracingExpert', totalWins: 720, totalWagered: 9500, winRate: 0.76 },
    { username: 'MonitoringGuru', totalWins: 650, totalWagered: 8900, winRate: 0.73 },
    { username: 'APMSpecialist', totalWins: 580, totalWagered: 8100, winRate: 0.72 },
    { username: 'SmartscapeNavigator', totalWins: 520, totalWagered: 7300, winRate: 0.71 },
    { username: 'CloudObserver', totalWins: 480, totalWagered: 6800, winRate: 0.71 },
    { username: 'PerformanceTracker', totalWins: 420, totalWagered: 6200, winRate: 0.68 }
  ];
  
  logTelemetry('LEADERBOARD_REQUEST', {
    action: 'get_leaderboard',
    correlationId
  });
  
  res.json({
    leaderboard,
    correlationId,
    timestamp: new Date().toISOString()
  });
});

/**
 * Slots Test Payout API - For testing specific symbol combinations
 */
app.post('/api/slots/test-payout', dynatraceMiddleware(SERVICE_NAMES.slots), (req, res) => {
  const { symbols, betAmount } = req.body;
  const actualBetAmount = betAmount || 10;
  const correlationId = generateCorrelationId();
  
  try {
    // Calculate win based on provided symbols
    const uniqueIcons = [...new Set(symbols)];
    const isWin = uniqueIcons.length === 1 || uniqueIcons.length === 2;
    
    let multiplier = 0;
    if (uniqueIcons.length === 1) {
      // All three symbols match
      const symbol = uniqueIcons[0];
      if (symbol === 'dynatrace') {
        multiplier = 50; // Special Dynatrace jackpot
      } else if (symbol === 'diamond') {
        multiplier = 20;
      } else if (symbol === 'seven') {
        multiplier = 10;
      } else if (symbol === 'cherry') {
        multiplier = 5;
      } else {
        multiplier = 3;
      }
    } else if (uniqueIcons.length === 2) {
      // Two matching symbols
      multiplier = 2;
    }
    
    const winAmount = isWin ? actualBetAmount * multiplier : 0;
    
    const responseData = {
      symbols,
      win: isWin,
      winAmount,
      betAmount: actualBetAmount,
      multiplier: isWin ? multiplier : 0,
      correlationId,
      timestamp: new Date().toISOString()
    };
    
    logTelemetry('SLOTS_TEST_PAYOUT', {
      game: 'Vegas Slots',
      action: 'test-payout',
      symbols,
      betAmount: actualBetAmount,
      win: isWin,
      winAmount,
      multiplier,
      correlationId
    });
    
    res.json(responseData);
    
  } catch (error) {
    const errorData = {
      error: 'SLOTS_TEST_ERROR',
      message: error.message,
      correlationId,
      timestamp: new Date().toISOString()
    };
    
    logTelemetry('ERROR', {
      game: 'Vegas Slots',
      action: 'test-payout',
      error: error.message,
      correlationId
    });
    
    res.status(500).json(errorData);
  }
});

/**
 * Health check endpoint - Returns server status
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Start periodic metrics simulation
setInterval(() => {
  simulateSystemMetrics();
  io.emit('metrics-update', gameMetrics);
}, 5000); // Update every 5 seconds

// Comprehensive Load Testing System - Auto-start on server launch
let loadTestingActive = false;

const loadTestCustomers = [
    {
        id: 0,
        customer_name: "John Smith",
        email: "john@email.com", 
        company_name: "TechCorp",
        persona: "Developer",
        booth: "Demo Booth 1",
        balance: 2500
    },
    {
        id: 1,
        customer_name: "Sarah Johnson",
        email: "sarah@company.com",
        company_name: "DataCorp", 
        persona: "Manager",
        booth: "Demo Booth 2",
        balance: 1800
    },
    {
        id: 2,
        customer_name: "Mike Wilson",
        email: "mike@startup.io",
        company_name: "StartupInc",
        persona: "CTO", 
        booth: "Training Session",
        balance: 3200
    },
    {
        id: 3,
        customer_name: "Lisa Brown",
        email: "lisa@enterprise.com",
        company_name: "Enterprise Ltd",
        persona: "Analyst",
        booth: "Partner Demo", 
        balance: 2100
    },
    {
        id: 4,
        customer_name: "David Lee",
        email: "david@consulting.com",
        company_name: "ConsultCorp",
        persona: "Consultant",
        booth: "POC Demo",
        balance: 1900
    },
    {
        id: 5,
        customer_name: "Emma Davis", 
        email: "emma@fintech.com",
        company_name: "FinTech Solutions",
        persona: "Engineer",
        booth: "Technical Demo",
        balance: 2700
    },
    {
        id: 6,
        customer_name: "Jenny Kim",
        email: "jenny@healthcare.org", 
        company_name: "HealthSystem",
        persona: "IT Manager",
        booth: "Healthcare Demo",
        balance: 2200
    }
];

// Helper function to get appropriate action for each game type
function getActionForGame(game) {
    const actionMap = {
        'slots': 'spin',
        'roulette': 'spin', 
        'dice': 'roll',
        'blackjack': 'deal'
    };
    return actionMap[game] || 'play';
}

async function simulateRealUserGameplay(customer, game, bet) {
    const correlationId = `load_test_${Date.now()}_${customer.id}_${Math.floor(Math.random() * 1000000000)}`;
    
    // Simulate cheating sometimes (50% chance)
    const isCheat = Math.random() < 0.5;
    const cheatTypes = ['win_boost', 'lucky_streak', 'house_edge'];
    const cheatType = cheatTypes[Math.floor(Math.random() * cheatTypes.length)];
    
    let postData = {
        Username: customer.customer_name,
        BetAmount: bet,
        correlationId: correlationId,
        // Add customer details with correct capitalization for game endpoints
        CustomerName: customer.customer_name,
        Email: customer.email,
        CompanyName: customer.company_name,
        Persona: customer.persona,
        Booth: customer.booth,
        OptIn: true,
        // Add game and action fields for proper logging and analytics
        Game: game,
        Action: getActionForGame(game)
    };

    // Add cheat data if simulating cheat
    if (isCheat) {
        postData.CheatActive = true;
        postData.CheatType = cheatType;
        postData.CheatDetails = {
            winBoost: 0.5 + Math.random() * 1.5, // 50-200% boost
            frequency: 0.3 + Math.random() * 0.4  // 30-70% frequency
        };
    }

    // Add game-specific parameters exactly as real users would send
    switch (game) {
        case 'roulette':
            postData.BetType = ['red', 'black', 'odd', 'even', '1-18', '19-36'][Math.floor(Math.random() * 6)];
            postData.BetNumber = Math.floor(Math.random() * 37); // 0-36 for European roulette
            break;
        case 'dice':
            postData.BetType = ['over7', 'under7', 'lucky7'][Math.floor(Math.random() * 3)];
            break;
    }

    return new Promise((resolve) => {
        const options = {
            hostname: '127.0.0.1',
            port: 8080,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'VegasCasino-LoadTester/1.0'
            }
        };

        // Set the correct API path - exactly what real users call
        switch (game) {
            case 'slots':
                options.path = '/api/slots/spin';
                break;
            case 'roulette':
                options.path = '/api/roulette/spin';
                break;
            case 'dice':
                options.path = '/api/dice/roll';
                break;
            case 'blackjack':
                options.path = '/api/blackjack/deal';
                break;
            default:
                options.path = '/api/slots/spin';
        }

        const postDataString = JSON.stringify(postData);
        options.headers['Content-Length'] = Buffer.byteLength(postDataString);

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
                        const response = JSON.parse(responseData);
                        resolve({
                            success: true,
                            data: response,
                            correlationId: correlationId
                        });
                    } else {
                        // Handle non-JSON responses
                        resolve({
                            success: true,
                            data: { message: 'completed', balance: 2000 + Math.floor(Math.random() * 500) },
                            correlationId: correlationId
                        });
                    }
                } catch (error) {
                    resolve({
                        success: false,
                        error: `Parse error`,
                        correlationId: correlationId
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message,
                correlationId: correlationId
            });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            resolve({
                success: false,
                error: 'Timeout',
                correlationId: correlationId
            });
        });

        try {
            req.write(postDataString);
            req.end();
        } catch (writeError) {
            resolve({
                success: false,
                error: `Write error: ${writeError.message}`,
                correlationId: correlationId
            });
        }
    });
}

async function generateLoadTestActivity() {
    if (!loadTestingActive) return;
    
    const customer = loadTestCustomers[Math.floor(Math.random() * loadTestCustomers.length)];
    const games = ['slots', 'roulette', 'dice', 'blackjack'];
    const game = games[Math.floor(Math.random() * games.length)];
    const betAmounts = [10, 25, 50, 100, 250];
    const bet = betAmounts[Math.floor(Math.random() * betAmounts.length)];
    
    try {
        const result = await simulateRealUserGameplay(customer, game, bet);
        
        if (result.success) {
            const outcome = result.data.outcome || 'completed';
            const winAmount = result.data.winAmount || 0;
            const balanceInfo = result.data.balance !== undefined ? ` (Balance: $${result.data.balance})` : '';
            
            console.log(`🎮 [CASINO_GAME_ACTIVITY] ${customer.customer_name} - ${game.toUpperCase()} - Bet: $${bet} - ${outcome.toUpperCase()}${winAmount > 0 ? ` +$${winAmount}` : ''}${balanceInfo}`);
            
            // Log detailed activity in the expected format
            const activityLog = {
                timestamp: new Date().toISOString(),
                customer_name: customer.customer_name,
                email: customer.email,
                company_name: customer.company_name,
                persona: customer.persona,
                booth: customer.booth,
                game_type: game,
                bet_amount: bet,
                outcome: outcome,
                win_amount: winAmount,
                balance: result.data.balance,
                correlation_id: result.correlationId,
                session_type: 'load_test'
            };
            
            console.log(`📊 [CASINO_ACTIVITY_DETAIL] ${JSON.stringify(activityLog)}`);
            
            // Occasionally simulate cheat detection (5% chance)
            if (Math.random() < 0.05) {
                setTimeout(() => {
                    const cheatTypes = ['cardCounting', 'streakBooster', 'autoPlay', 'balanceManipulation'];
                    const cheatType = cheatTypes[Math.floor(Math.random() * cheatTypes.length)];
                    
                    console.log(`🚨 [SECURITY_ALERT] CHEAT_DETECTED: ${customer.customer_name} - ${game.toUpperCase()} - Type: ${cheatType} - CorrelationID: ${result.correlationId}`);
                }, 1000 + Math.random() * 3000);
            }
            
        } else {
            console.log(`❌ [LOAD-TEST-ERROR] ${customer.customer_name} - ${game} request failed: ${result.error}`);
        }
        
    } catch (error) {
        console.log(`💥 [LOAD-TEST] ${customer.customer_name} - ${game} error:`, error.message);
    }
}

// Auto-start comprehensive load testing system after 30 second delay
setTimeout(() => {
    loadTestingActive = true;
    console.log('🚀 Comprehensive load testing system started (after 30s startup delay)');
    console.log(`👥 Simulating ${loadTestCustomers.length} customers with realistic casino activity`);
    
    // Schedule continuous load test activities
    function scheduleLoadTestActivity() {
        if (!loadTestingActive) return;
        
        // Generate activity every 15-35 seconds for realistic load (reduced frequency)
        const nextInterval = 15000 + Math.random() * 20000; // 15-35 seconds
        
        setTimeout(async () => {
            await generateLoadTestActivity();
            scheduleLoadTestActivity(); // Schedule next activity
        }, nextInterval);
    }
    
    // Start the load testing cycle
    scheduleLoadTestActivity();
    
    // Initial burst of activity to get things started
    setTimeout(async () => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => generateLoadTestActivity(), i * 2000);
        }
    }, 2000);
    
}, 30000); // Start load testing 30 seconds after server startup for full service initialization

// Load testing telemetry endpoint
app.post('/api/telemetry', (req, res) => {
  const { username, game, action, bet, amount, balance, simulation } = req.body;
  
  if (simulation) {
    // Log simulated activity
    logTelemetry('SIMULATED_ACTIVITY', {
      username,
      game,
      action,
      bet,
      amount,
      balance,
      timestamp: new Date().toISOString()
    });
    
    // Update metrics if needed
    if (action === 'play') {
      gameMetrics.totalSpins = (gameMetrics.totalSpins || 0) + 1;
    }
    
    res.json({ status: 'logged', simulation: true });
  } else {
    res.json({ status: 'ignored' });
  }
});

// Load testing cheat log endpoint
app.post('/api/cheat-log', (req, res) => {
  const { username, game, action, cheatType, simulation } = req.body;
  
  if (simulation) {
    // Log simulated cheat attempt
    logCheatActivity({
      username,
      game,
      cheatType: cheatType || 'simulated',
      action: action || 'cheat_attempt',
      timestamp: new Date().toISOString(),
      simulation: true
    });
    
    res.json({ status: 'logged', simulation: true });
  } else {
    res.json({ status: 'ignored' });
  }
});

// Comprehensive load test activity logging endpoint
app.post('/api/log-activity', (req, res) => {
  const activityData = req.body;
  
  // Log the comprehensive activity data exactly as provided
  const logEntry = JSON.stringify(activityData);
  
  // Write to vegas-activity log file
  const today = new Date().toISOString().split('T')[0];
  const logFileName = `vegas-cheat-logs/vegas-activity-${today}.log`;
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Ensure directory exists
    const logDir = path.join(__dirname, 'vegas-cheat-logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Append to log file
    fs.appendFileSync(path.join(__dirname, logFileName), logEntry + '\n');
    
    // Also log to console for monitoring
    console.log(`[${activityData.level}] ${activityData.event_type}: ${activityData.customer_name} - ${activityData.game} ${activityData.action} ($${activityData.bet_amount})`);
    
    res.json({ status: 'logged', timestamp: activityData.timestamp });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  const correlationId = generateCorrelationId();
  
  logTelemetry('SERVER_ERROR', {
    error: err.message,
    stack: err.stack,
    correlationId
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    correlationId,
    timestamp: new Date().toISOString()
  });
});

// Enhanced server startup with error handling and monitoring
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎰 Dynatrace Vegas Casino Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Metrics available at http://0.0.0.0:${PORT}/metrics`);
  console.log(`🌐 External access available at http://3.85.230.103:${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time updates`);
  console.log(`💚 [HEALTH] Self-healing enabled for 48+ hour uptime`);
  
  // Start health monitoring
  const healthMonitor = setInterval(() => {
    try {
      checkSystemHealth();
    } catch (error) {
      trackError(error, 'healthMonitor');
    }
  }, HEALTH_CONFIG.healthCheckInterval);
  
  // Periodic cleanup tasks
  const cleanupInterval = setInterval(() => {
    try {
      cleanupLogFiles();
    } catch (error) {
      trackError(error, 'cleanup');
    }
  }, HEALTH_CONFIG.logCleanupInterval);
  
  // Pre-start game services with error handling
  const services = [
    { name: SERVICE_NAMES.slots, path: path.join('services','slots-service.js') },
    { name: SERVICE_NAMES.roulette, path: path.join('services','roulette-service.js') },
    { name: SERVICE_NAMES.dice, path: path.join('services','dice-service.js') },
    { name: SERVICE_NAMES.blackjack, path: path.join('services','blackjack-service.js') }
  ];
  
  services.forEach(service => {
    try {
      startChildService(service.name, service.path);
    } catch (error) {
      trackError(error, `service-${service.name}`);
      console.warn(`⚠️  [SERVICE] Failed to start ${service.name}, will retry on demand`);
    }
  });
  
  // Store cleanup functions for graceful shutdown
  process.healthMonitor = healthMonitor;
  process.cleanupInterval = cleanupInterval;
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`💥 [SERVER] Port ${PORT} is already in use`);
    console.log(`🔄 [SERVER] Trying to restart existing server...`);
    setTimeout(() => {
      server.listen(PORT, '0.0.0.0');
    }, 5000);
  } else {
    trackError(error, 'server');
    console.error(`💥 [SERVER] Server error:`, error);
  }
});

server.on('clientError', (error, socket) => {
  trackError(error, 'clientError');
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

/**
 * Remote Lockout System - Dynatrace can trigger user lockouts
 */
// In-memory lockout store (in production, use Redis or database)
const userLockouts = new Map(); // key: Username, value: { locked: boolean, reason: string, timestamp: string, duration: number }

// CORS is already handled globally at the top of the file

// Endpoint for Dynatrace to trigger lockouts via API
app.post('/api/admin/lockout-user', (req, res) => {
  const { Username, Reason, Duration = 0 } = req.body;
  
  if (!Username) {
    return res.status(400).json({ error: 'Username required' });
  }
  
  userLockouts.set(Username, {
    locked: true,
    reason: Reason || 'Security violation detected',
    timestamp: new Date().toISOString(),
    duration: Duration // minutes, 0 = indefinite
  });
  
  console.log(`🚫 [LOCKOUT] User ${Username} locked: ${Reason}`);
  
  res.json({ 
    success: true, 
    message: `User ${Username} has been locked out`,
    lockout: userLockouts.get(Username)
  });
});

// Function to convert Python dictionary syntax to valid JSON
function pythonDictToJson(pythonStr) {
  if (typeof pythonStr !== 'string') return pythonStr;
  
  try {
    // Handle complex Python-style JSON with nested JSON strings
    let tempJson = pythonStr;
    
    // Find and encode all JSON strings within single quotes to protect them
    const jsonStringPattern = /'(\{[^}]*\})'/g;
    const protectedStrings = new Map();
    let protectCounter = 0;
    
    tempJson = tempJson.replace(jsonStringPattern, (match, jsonContent) => {
      const placeholder = `__PROTECTED_JSON_${protectCounter}__`;
      protectedStrings.set(placeholder, `"${jsonContent.replace(/"/g, '\\"')}"`);
      protectCounter++;
      return placeholder;
    });
    
    // Now safely convert Python syntax to JSON
    let jsonStr = tempJson
      .replace(/'/g, '"')                    // Single quotes to double quotes
      .replace(/False/g, 'false')            // Python False to JSON false
      .replace(/True/g, 'true')              // Python True to JSON true
      .replace(/None/g, 'null')              // Python None to JSON null
      .replace(/\bNone\b/g, 'null')          // Word boundary None
      .replace(/:\s*None\b/g, ': null')      // Handle ": None" patterns
      .replace(/\[\s*None\b/g, '[null')      // Handle "[ None" patterns  
      .replace(/,\s*None\b/g, ', null')      // Handle ", None" patterns
      .replace(/None\s*,/g, 'null,')         // Handle "None," patterns
      .replace(/None\s*\]/g, 'null]')        // Handle "None ]" patterns
      .replace(/None\s*}/g, 'null}');        // Handle "None }" patterns
    
    // Restore protected JSON strings
    protectedStrings.forEach((value, placeholder) => {
      jsonStr = jsonStr.replace(placeholder, value);
    });
    
    return JSON.parse(jsonStr);
  } catch (e) {
    console.log('⚠️ Failed to parse as JSON after Python conversion:', e.message);
    console.log('🔍 Problem area around character', e.message.match(/position (\d+)/)?.[1] || 'unknown');
    const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || '0');
    if (pos > 0) {
      const context = pythonStr.substring(Math.max(0, pos - 50), pos + 50);
      console.log('🔍 Context around error:', context);
    }
    return pythonStr;
  }
}

// Enhanced endpoint for Dynatrace workflows with DQL query results
app.post('/api/admin/lockout-user-cheat', (req, res) => {
  try {
    // Handle potential Python dictionary syntax from Dynatrace
    let processedBody = req.body;
    if (typeof req.body === 'string') {
      console.log('📥 Received string body, attempting Python dict conversion');
      processedBody = pythonDictToJson(req.body);
    }
    
    console.log('📥 Final parsed body:', JSON.stringify(processedBody, null, 2));
    console.log('📥 Body type:', typeof processedBody);
    
    // Handle multiple possible formats from Dynatrace workflows
    let cheatRecords;
    
    if (Array.isArray(processedBody)) {
      // Direct array format
      cheatRecords = processedBody;
    } else if (processedBody && processedBody.cheatRecords) {
      // Wrapped in cheatRecords object
      if (typeof processedBody.cheatRecords === 'object' && processedBody.cheatRecords.records) {
        // cheatRecords.records format (from Dynatrace)
        cheatRecords = processedBody.cheatRecords.records;
      } else if (Array.isArray(processedBody.cheatRecords)) {
        // Direct array in cheatRecords
        cheatRecords = processedBody.cheatRecords;
      }
    } else if (processedBody && Array.isArray(processedBody.records)) {
      // Direct records array
      cheatRecords = processedBody.records;
    } else if (processedBody && processedBody.records) {
      // Object with records
      cheatRecords = processedBody.records;
    } else {
      return res.status(400).json({ 
        error: 'Invalid request format. Could not find cheat records.',
        receivedType: typeof processedBody,
        receivedKeys: processedBody ? Object.keys(processedBody) : 'none',
        originalBodyType: typeof req.body,
        hint: 'Expected array or object with cheatRecords/records property'
      });
    }
    
    if (!Array.isArray(cheatRecords) || cheatRecords.length === 0) {
      return res.status(400).json({ 
        error: 'cheatRecords must be a non-empty array',
        received: cheatRecords,
        receivedType: typeof cheatRecords
      });
    }
    
    const results = [];
    
    // Process each cheat record from DQL query
    cheatRecords.forEach((record, index) => {
      try {
        console.log(`🔍 Record ${index} fields:`, Object.keys(record));
        const username = record['json.CustomerName'] || record['json.customer_name'] || record.username;
        const cheatType = record['json.cheatType'] || record['json.cheat_type'] || record.cheat_type;
        const winAmount = parseFloat(record['json.winAmount'] || record['json.win_amount'] || record.win_amount || 0);
        
        console.log(`🔍 Extracted: username="${username}", cheatType="${cheatType}", winAmount=${winAmount}`);
        
        if (!username) {
          results.push({ index, error: 'Missing username', record });
          return;
        }
      
      // Calculate total cheat winnings for this user
      const userCheats = cheatRecords.filter(r => 
        (r['json.CustomerName'] || r['json.customer_name'] || r.username) === username
      );
      const totalCheatWinnings = userCheats.reduce((sum, r) => 
        sum + parseFloat(r['json.winAmount'] || r['json.win_amount'] || r.win_amount || 0), 0
      );
      
      // Deduct cheat winnings from user balance
      const user = getOrCreateUser(username);
      const balanceBefore = user.balance;
      updateUserBalance(username, -totalCheatWinnings);
      const balanceAfter = users.get(username).balance;
      
      // Lock the user
      const reason = `Cheat detected: ${cheatType.toUpperCase()} (${userCheats.length} violations, $${totalCheatWinnings} confiscated)`;
      userLockouts.set(username, {
        locked: true,
        reason: reason,
        timestamp: new Date().toISOString(),
        duration: 60, // 1 hour lockout for cheating
        cheatData: {
          totalViolations: userCheats.length,
          totalWinningsConfiscated: totalCheatWinnings,
          cheatTypes: [...new Set(userCheats.map(r => r['json.cheat_type'] || r.cheat_type))],
          detectedAt: new Date().toISOString()
        }
      });
      
      console.log(`🚨 [CHEAT-LOCKOUT] User ${username}: ${userCheats.length} violations, $${totalCheatWinnings} confiscated, balance ${balanceBefore} → ${balanceAfter}`);
      
      // Notify UI via WebSocket for user-specific lockout
      try {
        if (io) {
          io.emit('user-lockout', {
            username: username,
            locked: true,
            reason: reason,
            timestamp: new Date().toISOString(),
            cheatData: {
              violations: userCheats.length,
              winningsConfiscated: totalCheatWinnings,
              balanceAdjustment: `${balanceBefore} → ${balanceAfter}`
            }
          });
          console.log(`📡 [LOCKOUT-NOTIFICATION] Sent UI lockout notification for ${username}`);
        }
      } catch (wsError) {
        console.warn(`⚠️ Failed to send WebSocket lockout notification: ${wsError.message}`);
      }
      
      results.push({
        index,
        username,
        success: true,
        action: 'locked_and_balance_adjusted',
        cheatViolations: userCheats.length,
        totalWinningsConfiscated: totalCheatWinnings,
        balanceBefore,
        balanceAfter,
        lockReason: reason
      });
      } catch (recordError) {
        console.error(`❌ Error processing record ${index}:`, recordError);
        results.push({ index, error: `Processing error: ${recordError.message}`, record });
      }
    });
    
    // Group results by username to avoid duplicates
    const uniqueResults = results.reduce((acc, result) => {
      if (result.username && !acc.find(r => r.username === result.username)) {
        acc.push(result);
      } else if (!result.username) {
        acc.push(result); // Include errors
      }
      return acc;
    }, []);
    
    res.json({
      success: true,
      message: `Processed ${cheatRecords.length} cheat records for ${uniqueResults.filter(r => r.success).length} unique users`,
      results: uniqueResults,
      summary: {
        totalRecordsProcessed: cheatRecords.length,
        uniqueUsersLocked: uniqueResults.filter(r => r.success).length,
        totalWinningsConfiscated: uniqueResults.reduce((sum, r) => sum + (r.totalWinningsConfiscated || 0), 0)
      }
    });
    
  } catch (error) {
    console.error('❌ Error processing cheat lockout:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Endpoint for Dynatrace to release lockouts
app.post('/api/admin/unlock-user', (req, res) => {
  const { Username } = req.body;
  
  if (!Username) {
    return res.status(400).json({ error: 'Username required' });
  }
  
  userLockouts.delete(Username);
  console.log(`✅ [UNLOCK] User ${Username} lockout released`);
  
  res.json({ success: true, message: `User ${Username} has been unlocked` });
});

// Check user lockout status
app.get('/api/admin/lockout-status/:username', (req, res) => {
  const username = req.params.username;
  
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }
  
  const lockoutData = userLockouts.get(username);
  
  if (!lockoutData) {
    return res.json({ 
      locked: false, 
      username: username,
      status: 'active' 
    });
  }
  
  // Check if lockout has expired (if duration is set)
  if (lockoutData.duration && lockoutData.duration > 0) {
    const lockoutTime = new Date(lockoutData.timestamp);
    const expirationTime = new Date(lockoutTime.getTime() + (lockoutData.duration * 60000));
    
    if (new Date() > expirationTime) {
      // Lockout expired, remove it
      userLockouts.delete(username);
      console.log(`⏰ [LOCKOUT-EXPIRED] User ${username} lockout automatically expired`);
      
      return res.json({ 
        locked: false, 
        username: username,
        status: 'expired',
        expiredAt: expirationTime.toISOString()
      });
    }
  }
  
  // User is still locked
  res.json({ 
    locked: true, 
    username: username,
    reason: lockoutData.reason,
    timestamp: lockoutData.timestamp,
    duration: lockoutData.duration,
    cheatData: lockoutData.cheatData,
    status: 'locked'
  });
});

// Client-side lockout status check
app.post('/api/user/lockout-check', (req, res) => {
  const { Username } = req.body;
  const lockoutData = userLockouts.get(Username);
  
  if (!lockoutData || !lockoutData.locked) {
    return res.json({ lockoutRequired: false });
  }
  
  // Check if timed lockout has expired
  if (lockoutData.duration > 0) {
    const lockTime = new Date(lockoutData.timestamp);
    const expiryTime = new Date(lockTime.getTime() + (lockoutData.duration * 60000));
    
    if (new Date() > expiryTime) {
      userLockouts.delete(Username);
      return res.json({ lockoutRequired: false });
    }
  }
  
  res.json({
    lockoutRequired: true,
    reason: lockoutData.reason,
    timestamp: lockoutData.timestamp,
    duration: lockoutData.duration,
    // Include detailed cheat data if available
    cheatData: lockoutData.cheatData || null
  });
});

// Lockout confirmation tracking
app.post('/api/user/lockout-confirmed', (req, res) => {
  // Log that user received lockout notification
  console.log(`📋 [LOCKOUT-CONFIRMED] User: ${req.body.Username}, Reason: ${req.body.LockoutReason}`);
  res.json({ received: true });
});

/**
 * Health Check and Monitoring Endpoints for 48+ Hour Uptime
 */

// Comprehensive health check endpoint
app.get('/health', (req, res) => {
  try {
    const healthStatus = checkSystemHealth();
    
    // Add service-specific checks
    const serviceHealth = {
      main: true,
      websocket: io.engine.clientsCount >= 0,
      userSessions: userSessions.size,
      lockouts: userLockouts.size
    };
    
    const overallHealth = {
      status: HEALTH_CONFIG.isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: healthStatus.uptime,
      memory: {
        heapUsed: Math.round(healthStatus.memory.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(healthStatus.memory.heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(healthStatus.memory.rss / 1024 / 1024) + 'MB'
      },
      errors: healthStatus.errors,
      services: serviceHealth,
      version: '2.0.0-resilient',
      pid: process.pid
    };
    
    const httpStatus = HEALTH_CONFIG.isHealthy ? 200 : 503;
    res.status(httpStatus).json(overallHealth);
    
  } catch (error) {
    trackError(error, 'healthCheck');
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Admin endpoints for monitoring and management
app.get('/api/admin/system-metrics', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    res.json({
      system: {
        uptime: Math.floor(process.uptime()),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      },
      memory: memUsage,
      cpu: cpuUsage,
      health: {
        errorCount: HEALTH_CONFIG.errorCount,
        lastError: HEALTH_CONFIG.lastError,
        startTime: HEALTH_CONFIG.startTime,
        memoryThreshold: HEALTH_CONFIG.memoryThreshold,
        errorThreshold: HEALTH_CONFIG.errorThreshold
      },
      sessions: {
        active: userSessions.size,
        lockedOut: userLockouts.size
      }
    });
  } catch (error) {
    trackError(error, 'systemMetrics');
    res.status(500).json({ error: 'Failed to get system metrics' });
  }
});

app.post('/api/admin/self-heal', (req, res) => {
  try {
    console.log('🚨 Manual self-healing triggered');
    performSelfHealing();
    
    res.json({
      success: true,
      message: 'Self-healing procedures executed',
      timestamp: new Date().toISOString(),
      actions: [
        'Garbage collection performed',
        'Log files rotated',
        'Error counters reset',
        'Memory usage optimized'
      ]
    });
  } catch (error) {
    console.error('❌ Self-healing failed:', error);
    trackError(error, 'selfHealing');
    res.status(500).json({
      success: false,
      message: 'Self-healing failed',
      error: error.message
    });
  }
});

// Detailed system metrics endpoint
app.get('/api/admin/system-metrics', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    res.json({
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      },
      cpu: cpuUsage,
      errors: HEALTH_CONFIG.errorCounts,
      connections: {
        websockets: io.engine.clientsCount,
        userSessions: userSessions.size,
        lockouts: userLockouts.size
      },
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid
    });
  } catch (error) {
    trackError(error, 'systemMetrics');
    res.status(500).json({ error: 'Failed to get system metrics' });
  }
});

// Self-healing trigger endpoint (for manual recovery)
app.post('/api/admin/self-heal', (req, res) => {
  try {
    console.log('🔧 [MANUAL] Self-healing triggered via API');
    performSelfHealing();
    res.json({ 
      success: true, 
      message: 'Self-healing procedures executed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    trackError(error, 'manualSelfHeal');
    res.status(500).json({ 
      success: false, 
      error: 'Self-healing failed',
      details: error.message
    });
  }
});

/**
 * Error Handling Middleware for Production Resilience
 */

// Global error handler - MUST be last middleware
app.use((error, req, res, next) => {
  trackError(error, `route-${req.method}-${req.path}`);
  
  console.error(`💥 [ROUTE-ERROR] ${req.method} ${req.path}:`, error.message);
  
  // Don't expose internal error details in production
  const errorResponse = {
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId || generateCorrelationId()
  };
  
  res.status(500).json(errorResponse);
});

// Admin console route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 404 handler for undefined routes
app.use((req, res) => {
  const errorMsg = `Route not found: ${req.method} ${req.path}`;
  console.warn(`⚠️  [404] ${errorMsg}`);
  
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// The graceful shutdown handlers are already defined above in the global section
// (They were moved to the top with the other process handlers)