// index.js
const express = require('express');
const bodyParser = require('body-parser');
const consent = require('./modules/consent');
const finance = require('./modules/finance');
const { replyMessage } = require('./utils/reply');

const app = express();
app.use(bodyParser.json());

// เก็บ state ของ user (ทดลองใช้ memory; ใน production ควรใช้ DB)
const userStates = {};

app.post('/webhook', (req, res) => {
  const event = req.body.events[0];
  if (!event || !event.message) return res.sendStatus(200);

  const userId = event.source.userId;
  const text = event.message.text;

  if (!userStates[userId]) userStates[userId] = 'waiting_for_consent';

  // ----- PDPA Consent -----
  if (userStates[userId] === 'waiting_for_consent') {
    consent.handleConsent(userId, text, userStates, replyMessage);
  } 
  // ----- Finance Flow -----
  else if (userStates[userId].startsWith('finance_')) {
    finance.handleFinance(userId, text, userStates, replyMessage);
  }

  res.sendStatus(200);
});

app.listen(3000, () => console.log('Bot running on port 3000'));
