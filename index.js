const express = require('express');
const app = express();
const consent = require('./modules/consent');
const finance = require('./modules/finance');

app.use(express.json());

// เก็บ state ของ user
const userStates = {};

app.post('/webhook', (req, res) => {
  const event = req.body.events?.[0];
  if (!event || event.type !== 'message') return res.sendStatus(200);

  const userId = event.source.userId;
  const text = event.message.text;

  // ถ้ายังไม่ได้ยินยอม PDPA
  if (!userStates[userId]?.consent) {
    return consent.handleConsent(userId, text, userStates);
  }

  // ถ้า consent แล้ว เข้าสู่หมวด “เรื่องการเงินกับน้องฟิน”
  finance.handleFinance(userId, text, userStates);
  res.sendStatus(200);
});

app.listen(3000, () => console.log('🤖 Finway Bot running on port 3000'));
