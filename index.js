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

// เก็บ state ของ user (ในหน่วยความจำ — สำหรับ production ควรใช้ DB เช่น Redis)
const userStates = {};

// ===== Webhook Handler =====
app.post('/webhook', (req, res) => {
  // ตอบกลับ LINE ทันที เพื่อป้องกัน timeout / 502
  res.sendStatus(200);

  try {
    const event = req.body.events?.[0];
    if (!event || !event.message) return;

    const userId = event.source.userId;
    const text = event.message.text?.trim();

    if (!userStates[userId]) userStates[userId] = 'waiting_for_consent';

    // ----- PDPA Consent Flow -----
    if (userStates[userId] === 'waiting_for_consent') {
      consent.handleConsent(userId, text, userStates, replyMessage);
    }
    // ----- Finance Flow -----
    else if (userStates[userId].startsWith('finance_')) {
      finance.handleFinance(userId, text, userStates, replyMessage);
    }
    // ----- Default Fallback -----
    else {
      replyMessage(userId, "พิมพ์ 'เริ่มต้น' เพื่อเริ่มใช้งานระบบนะครับ 🙂");
      userStates[userId] = 'waiting_for_consent';
    }
  } catch (err) {
    console.error('❌ Webhook handler error:', err);
  }
});

// ===== Health Check Endpoint =====
app.get('/', (req, res) => {
  res.send('✅ Finway Bot is running');
});

// ===== Start Server =====
const PORT = process.env.PORT;
if (!PORT) {
  console.error('❌ PORT not defined!');
  process.exit(1);
}
app.listen(PORT, () => console.log(`🚀 Bot running on port ${PORT}`));

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down...');
  process.exit(0);
});
