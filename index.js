const express = require('express');
const bodyParser = require('body-parser');
const consent = require('./modules/consent');
const finance = require('./modules/finance');
const { replyMessage } = require('./utils/reply');

const app = express();
app.use(bodyParser.json());

const userStates = {};

app.post('/webhook', (req, res) => {
  res.sendStatus(200); // ตอบทันที

  try {
    const event = req.body.events?.[0];
    if (!event || !event.message) return;

    const userId = event.source.userId;
    const text = event.message.text?.trim();

    if (!userStates[userId]) userStates[userId] = 'waiting_for_consent';

    if (userStates[userId] === 'waiting_for_consent') {
      consent.handleConsent(userId, text, userStates, replyMessage);
    } else if (userStates[userId].startsWith('finance_')) {
      finance.handleFinance(userId, text, userStates, replyMessage);
    } else {
      replyMessage(userId, "พิมพ์ 'เริ่มต้น' เพื่อเริ่มใช้งานระบบนะครับ 🙂");
      userStates[userId] = 'waiting_for_consent';
    }
  } catch (err) {
    console.error('❌ Webhook handler error:', err);
  }
});

app.get('/', (req, res) => res.send('✅ Finway Bot is running'));

const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => console.log(`🚀 Bot running on port ${PORT}`));

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
