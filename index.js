// ======================
// index.js
// ======================
const express = require('express');
const bodyParser = require('body-parser');
const consent = require('./modules/consent');
const finance = require('./modules/finance');
const { replyMessage } = require('./utils/reply');

const app = express();
app.use(bodyParser.json());

// เก็บ state ของ user (สำหรับ production แนะนำ DB เช่น Redis)
const userStates = {};

// ===== Webhook Handler =====
app.post('/webhook', (req, res) => {
  // ตอบ 200 ทันทีเพื่อป้องกัน timeout
  res.sendStatus(200);

  try {
    const event = req.body.events?.[0];
    if (!event || !event.message) return;

    const userId = event.source.userId;
    const text = event.message.text?.trim();

    if (!userStates[userId]) userStates[userId] = 'waiting_for_consent';

    // PDPA Consent
    if (userStates[userId] === 'waiting_for_consent') {
      try {
        consent.handleConsent(userId, text, userStates, replyMessage);
      } catch (err) {
        console.error('❌ Consent handler error:', err);
      }
    }
    // Finance Flow
    else if (userStates[userId].startsWith('finance_')) {
      try {
        finance.handleFinance(userId, text, userStates, replyMessage);
      } catch (err) {
        console.error('❌ Finance handler error:', err);
      }
    }
    // Fallback
    else {
      try {
        replyMessage(userId, "พิมพ์ 'เริ่มต้น' เพื่อเริ่มใช้งานระบบนะครับ 🙂");
      } catch (err) {
        console.error('❌ replyMessage error:', err);
      }
      userStates[userId] = 'waiting_for_consent';
    }
  } catch (err) {
    console.error('❌ Webhook handler error:', err);
  }
});

// Health check
app.get('/', (req, res) => res.send('✅ Finway Bot is running'));

// Start server
let PORT = parseInt(process.env.PORT, 10);
if (isNaN(PORT) || PORT <= 0 || PORT > 65535) {
  PORT = 8080; // default port
  console.warn(`⚠️ Invalid PORT env, fallback to ${PORT}`);
}
app.listen(PORT, () => console.log(`🚀 Bot running on port ${PORT}`));

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down...');
  process.exit(0);
});
