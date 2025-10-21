// index.js
const express = require('express');
const consent = require('./modules/consent');
const finance = require('./modules/finance');
const { replyMessage } = require('./utils/reply');

// ===== Startup Checks =====
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = ['CHANNEL_ACCESS_TOKEN', 'CHANNEL_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables in production:', missingVars.join(', '));
    process.exit(1);
  }
}

const app = express();
app.use(express.json()); // built-in parser

// ===== Security Middleware (Future Improvement) =====
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// app.use(helmet());
// app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 60 })); // 60 requests per minute

// ===== In-Memory User State =====
// NOTE: Replace with DB/Redis for production use
const userStates = {};

// ===== Health Check =====
app.get('/', (req, res) => res.send('✅ Finway Bot is running'));

// ===== Webhook Handler =====
app.post('/webhook', async (req, res) => {
  // Acknowledge LINE quickly
  res.sendStatus(200);

  // Validate request structure
  if (!req.body || !Array.isArray(req.body.events)) {
    console.warn('⚠️ Malformed webhook request - missing body or events array');
    return;
  }

  const events = req.body.events;
  if (!events.length) return;

  for (const event of events) {
    if (!event?.type || event.type !== 'message' || !event.source?.userId) continue;

    const userId = event.source.userId;
    const text = (event.message?.text || '').trim();

    // Log user activity for debugging/audit
    console.log(`👤 [${userId}] State: ${userStates[userId] || 'new'}, Message: "${text}"`);

    // Initialize user state
    if (!userStates[userId]) userStates[userId] = 'waiting_for_consent';

    try {
      if (userStates[userId] === 'waiting_for_consent') {
        await consent.handleConsent(userId, text, userStates, replyMessage);
      } else if (String(userStates[userId]).startsWith('finance_')) {
        await finance.handleFinance(userId, text, userStates, replyMessage);
      } else {
        await replyMessage(userId, "พิมพ์ 'เริ่มต้น' เพื่อเริ่มใช้งานระบบนะครับ 🙂");
        userStates[userId] = 'waiting_for_consent';
      }
    } catch (innerErr) {
      console.error(`❌ Error handling user event [${userId}]:`, innerErr);
      try {
        await replyMessage(userId, 'ขออภัยเกิดข้อผิดพลาดภายในระบบ กรุณาลองอีกครั้งในภายหลังค่ะ');
      } catch (notifyErr) {
        console.error('❌ Failed to notify user about error:', notifyErr);
      }
    }
  }
});

// ===== Port Configuration =====
const rawPort = process.env.PORT;
let PORT = Number.parseInt(rawPort, 10);

if (!PORT || Number.isNaN(PORT)) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ process.env.PORT is required in production. Received:', rawPort);
    process.exit(1);
  } else {
    PORT = 3000; // Development fallback
    console.warn(`⚠️ process.env.PORT is missing or invalid. Using fallback port ${PORT} in development.`);
  }
}

// ===== Start Express Server =====
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Finway Bot running on port ${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
  console.log('🔐 Environment Status:', {
    NODE_ENV: process.env.NODE_ENV || 'development',
    CHANNEL_ACCESS_TOKEN: process.env.CHANNEL_ACCESS_TOKEN ? '✅ Set' : '❌ Missing',
    CHANNEL_SECRET: process.env.CHANNEL_SECRET ? '✅ Set' : '❌ Missing',
    PORT: PORT
  });
});

// ===== Graceful Shutdown Handlers =====
const gracefulShutdown = (signal) => {
  console.log(`\n📢 Received ${signal}, starting graceful shutdown...`);
  
  // Stop accepting new requests
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server close:', err);
      process.exit(1);
    }
    
    console.log('✅ HTTP server closed.');
    console.log('✅ Finway Bot shutdown complete.');
    process.exit(0);
  });

  // Force close after 8 seconds (Railway's timeout is usually 10s)
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 8000);
};

// Handle different shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Railway uses this
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('🔧 Graceful shutdown handlers registered');
