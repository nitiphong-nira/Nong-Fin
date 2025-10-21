// index.js
const express = require('express');
const consent = require('./modules/consent');
const finance = require('./modules/finance');
const { replyMessage } = require('./utils/reply');

// ===== Required Env Check =====
if (!process.env.CHANNEL_ACCESS_TOKEN || !process.env.CHANNEL_SECRET) {
  console.error('❌ Missing LINE credentials in environment variables');
  process.exit(1);
}

const app = express();
app.use(express.json()); // built-in parser

// ===== In-Memory User State =====
// NOTE: Replace with DB/Redis for production use
const userStates = {};

// ===== Health Check =====
app.get('/', (req, res) => res.send('✅ Finway Bot is running'));

// ===== Webhook Handler =====
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // Acknowledge LINE quickly

  try {
    const events = Array.isArray(req.body.events) ? req.body.events : [];
    if (!events.length) return;

    for (const event of events) {
      if (!event?.type || event.type !== 'message' || !event.source?.userId) continue;

      const userId = event.source.userId;
      const text = (event.message?.text || '').trim();

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
        console.error('❌ Error handling user event:', innerErr);
        try {
          await replyMessage(userId, 'ขออภัยเกิดข้อผิดพลาดภายในระบบ กรุณาลองอีกครั้งในภายหลังค่ะ');
        } catch (notifyErr) {
          console.error('❌ Failed to notify user about error:', notifyErr);
        }
      }
    }
  } catch (err) {
    console.error('❌ Webhook handler top-level error:', err);
  }
});

// ===== Start Server =====
const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Finway Bot running on port ${PORT}`);
  console.log('🔐 Env status:', {
    NODE_ENV: process.env.NODE_ENV || 'development',
    CHANNEL_ACCESS_TOKEN_set: !!process.env.CHANNEL_ACCESS_TOKEN,
    CHANNEL_SECRET_set: !!process.env.CHANNEL_SECRET,
  });
});

// ===== Graceful Shutdown =====
process.on('SIGTERM', () => {
  console.log('🚦 SIGTERM received - shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🚦 SIGINT received - shutting down gracefully');
  process.exit(0);
});
