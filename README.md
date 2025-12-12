# 🎰 Vegas Casino - Advanced Business Observability Demo

A comprehensive Node.js casino application featuring multiple games with advanced analytics, fraud detection, and business observability integration.

## 🎮 Games Available

- **🎲 Process Dice** - Craps-style dice game with 3D animations
- **🎰 Slots** - Classic slot machine with various themes  
- **🔴 Roulette** - European roulette with multiple bet types
- **🃏 Blackjack** - Traditional card game with dealer AI

## ✨ Key Features

### 🎯 Advanced Game Mechanics
- **3D Animations** - Realistic dice rolling and slot spinning
- **Multiple Bet Types** - Various betting options per game
- **Progressive Payouts** - Dynamic payout calculations
- **Persistent State** - Maintains game state across sessions

### 🔍 Business Observability
- **Real-time Analytics** - Live game performance metrics
- **Player Behavior Tracking** - Comprehensive user journey analytics
- **Fraud Detection** - Advanced cheat detection algorithms
- **Balance Management** - Server-side balance validation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/lawrobar90/Vegas-App.git
cd Vegas-App

# Install dependencies
npm install

# Start the application
node server.js
```

### Access the Application
- **Main Casino**: http://localhost:8080
- **Game Lobby**: http://localhost:8080/lobby.html

## 🏗️ Architecture

### Microservices Design
- **Main Server** (Port 8080) - Central orchestrator and web server
- **Slots Service** (Port 8081) - Slot machine game logic
- **Roulette Service** (Port 8082) - Roulette game mechanics
- **Dice Service** (Port 8083) - Craps dice game engine
- **Blackjack Service** (Port 8084) - Card game logic

### Technology Stack
- **Backend**: Node.js with Express
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Animations**: GSAP (GreenSock)
- **Real-time**: Socket.IO
- **Styling**: Tailwind CSS

## 📊 Analytics & Monitoring

### Game Metrics
- Win/Loss ratios per game
- Average bet amounts
- Session duration tracking
- Player retention analytics

### Fraud Detection
- Unusual betting pattern detection
- Cheat system identification
- Risk score calculation
- Automated alerts for suspicious activity

## 🎯 Business Observability Use Cases

This application demonstrates real-world business observability patterns:

- **Customer Journey Tracking** - Complete user flow analytics
- **Performance Monitoring** - Real-time application health
- **Fraud Prevention** - Advanced anomaly detection
- **Revenue Optimization** - Data-driven game balancing

Perfect for demonstrating enterprise monitoring, analytics, and observability solutions in an engaging, interactive format.
