// index.js
const express = require('express');
const bodyParser = require('body-parser');
const consent = require('./modules/consent');
const finance = require('./modules/finance');
const { replyMessage } = require('./utils/reply');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// in-memory state (for production use DB/Redis)
const userStates = {};

// ===== health check =====
app.get('/', (req, res) => res.send('✅ Finway Bot is running'));

// ===== webhook handler =====
app.post('/webhook', async (req, res) => {
  // 1) ตอบ LINE ทันที เพื่อป้องกัน timeout/502
  res.sendStatus(200);

  // 2) process events asynchronously (แต่ไม่ block response)
  try {
    const events = Array.isArray(req.body.events) ? req.body.events : [];
    if (!events.length) return;

    for (const event of events) {
      // skip unsupported events safe-guard
      if (!event || !event.type) continue;
      // only handle message events with userId
      if (event.type !== 'message' || !event.source || !event.source.userId) continue;

      const userId = event.source.userId;
      const text = (event.message?.text || '').trim();

      // ensure state initialized
      if (!userStates[userId]) userStates[userId] = 'waiting_for_consent';

      // handle flows with try/catch per-user so one failure won't crash others
      try {
        if (userStates[userId] === 'waiting_for_consent') {
          // consent.handleConsent should be async-safe
          await consent.handleConsent(userId, text, userStates, replyMessage);
        } else if (String(userStates[userId]).startsWith('finance_')) {
          await finance.handleFinance(userId, text, userStates, replyMessage);
        } else {
          await replyMessage(userId, "พิมพ์ 'เริ่มต้น' เพื่อเริ่มใช้งานระบบนะครับ 🙂");
          userStates[userId] = 'waiting_for_consent';
        }
      } catch (innerErr) {
        console.error('❌ Error handling user event:', innerErr);
        // optionally notify the user of error (but be careful with token)
        try {
          await replyMessage(userId, 'ขออภัยเกิดข้อผิดพลาดภายในระบบ กรุณาลองอีกครั้งในภายหลังค่ะ');
        } catch (err) {
          console.error('❌ Failed to notify user about error:', err);
        }
      }
    }
  } catch (err) {
    console.error('❌ Webhook handler top-level error:', err);
  }
});

// ===== start server using Railway provided PORT =====
const rawPort = process.env.PORT;
const PORT = Number.parseInt(rawPort, 10);
if (!PORT || Number.isNaN(PORT)) {
  console.error('❌ process.env.PORT is not defined or invalid. Current value:', rawPort);
  // EXIT so deployment failure is visible instead of silent mis-binding
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Bot running on port ${PORT}`);
  // helpful for debugging from logs
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV || 'n/a',
    CHANNEL_ACCESS_TOKEN_set: !!process.env.CHANNEL_ACCESS_TOKEN,
    CHANNEL_SECRET_set: !!process.env.CHANNEL_SECRET,
  });
});

// graceful shutdown handlers - DO NOT immediately call process.exit() here except to cleanup
process.on('SIGTERM', () => {
  console.log('🚦 SIGTERM received - shutting down gracefully');
  // If you have open connections, close them here. We exit so Railway can restart if needed.
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('🚦 SIGINT received - shutting down gracefully');
  process.exit(0);
});
