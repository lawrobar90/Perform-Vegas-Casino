// Generic service runner that mounts only its own routes
const express = require('express');
const http = require('http');

function createService(name, mountFn, metadata = {}) {
  try { 
    // Set process title for distinct process identification
    process.title = name;
    
    // Set Dynatrace process group environment variables if not already set
    if (!process.env.DT_PROCESS_GROUP_ID) {
      process.env.DT_PROCESS_GROUP_ID = `${name}-process-group`;
    }
    if (!process.env.DT_SERVICE_NAME) {
      process.env.DT_SERVICE_NAME = name;
    }
  } catch (_) {}
  
  const app = express();
  app.use(express.json());

  // Enhanced Dynatrace Metadata Middleware for distinct service visibility
  app.use((req, res, next) => {
    // Core Dynatrace service identification
    res.setHeader('DT-Service-Name', process.env.DT_SERVICE_NAME || name);
    res.setHeader('DT-Process-Group-ID', process.env.DT_PROCESS_GROUP_ID || `${name}-process-group`);
    res.setHeader('DT-Application-Name', process.env.DT_APPLICATION_NAME || 'Vegas-Casino-Microservices');
    res.setHeader('DT-Service-Version', metadata.version || '2.1.0');
    res.setHeader('DT-Environment', process.env.DT_ENVIRONMENT || 'vegas-casino-production');
    res.setHeader('DT-Cluster-ID', process.env.DT_CLUSTER_ID || 'vegas-casino-cluster');
    res.setHeader('DT-Node-ID', process.env.DT_NODE_ID || `${name}-node`);
    
    // Business context headers
    res.setHeader('DT-Owner', metadata.owner || 'Vegas-Casino-Team');
    res.setHeader('DT-Technology', metadata.technology || 'Node.js-Express');
    res.setHeader('DT-Business-Unit', process.env.DT_CUSTOM_PROP_businessUnit || 'Digital-Gaming');
    
    // Game-specific custom properties from environment variables
    if (process.env.DT_CUSTOM_PROP_gameCategory) {
      res.setHeader('DT-Game-Category', process.env.DT_CUSTOM_PROP_gameCategory);
    }
    if (process.env.DT_CUSTOM_PROP_gameType) {
      res.setHeader('DT-Game-Type', process.env.DT_CUSTOM_PROP_gameType);
    }
    if (metadata.complexity || process.env.DT_CUSTOM_PROP_serviceComplexity) {
      res.setHeader('DT-Game-Complexity', metadata.complexity || process.env.DT_CUSTOM_PROP_serviceComplexity);
    }
    if (metadata.rtp || process.env.DT_CUSTOM_PROP_maxPayout) {
      res.setHeader('DT-Return-To-Player', metadata.rtp);
      res.setHeader('DT-Max-Payout', process.env.DT_CUSTOM_PROP_maxPayout);
    }
    
    next();
  });

  // Enhanced health check with comprehensive Dynatrace metadata
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      service: name,
      dynatraceMetadata: {
        processGroupId: process.env.DT_PROCESS_GROUP_ID || `${name}-process-group`,
        serviceName: process.env.DT_SERVICE_NAME || name,
        applicationName: process.env.DT_APPLICATION_NAME || 'Vegas-Casino-Microservices',
        environment: process.env.DT_ENVIRONMENT || 'vegas-casino-production',
        clusterId: process.env.DT_CLUSTER_ID || 'vegas-casino-cluster',
        nodeId: process.env.DT_NODE_ID || `${name}-node`
      },
      serviceMetadata: {
        version: metadata.version || '2.1.0',
        gameType: process.env.DT_CUSTOM_PROP_gameType || metadata.gameType || 'unknown',
        gameCategory: process.env.DT_CUSTOM_PROP_gameCategory || 'unknown',
        complexity: metadata.complexity || process.env.DT_CUSTOM_PROP_serviceComplexity || 'medium',
        rtp: metadata.rtp || 'variable',
        maxPayout: process.env.DT_CUSTOM_PROP_maxPayout || '1x',
        businessUnit: process.env.DT_CUSTOM_PROP_businessUnit || 'Digital-Gaming',
        owner: metadata.owner || 'Vegas-Casino-Team',
        technology: 'Node.js-Express',
        timestamp: new Date().toISOString()
      }
    });
  });

  // Mount service-specific routes
  mountFn(app);

  const server = http.createServer(app);
  const port = process.env.PORT || 0; // dynamic by default
  server.listen(port, () => {
    const address = server.address();
    const actualPort = typeof address === 'string' ? address : address.port;
    console.log(`[${name}] listening on port ${actualPort}`);
  });
}

module.exports = { createService };
