const express = require('express');
const app = express();
app.use(express.json());

// เก็บ state ของ user (ทดลอง ใช้ memory)
const userStates = {};

app.post('/webhook', (req, res) => {
  const event = req.body.events[0];
  const userId = event.source.userId;
  const text = event.message.text;

  // ตรวจสอบ state ของ user
  if (!userStates[userId]) userStates[userId] = 'start';

  if (userStates[userId] === 'start') {
    // ต้นทาง tree
    userStates[userId] = 'waiting_for_income_type';
    replyMessage(userId, 'คุณเป็นเงินเดือนหรือ freelance?');
  } else if (userStates[userId] === 'waiting_for_income_type') {
    if (text.includes('เงินเดือน')) {
      userStates[userId] = 'waiting_for_job_type';
      replyMessage(userId, 'คุณทำงานราชการหรือเอกชน?');
    } else if (text.includes('freelance')) {
      userStates[userId] = 'waiting_for_vat';
      replyMessage(userId, 'คุณจด VAT หรือไม่?');
    }
  }

  res.sendStatus(200);
});

function replyMessage(userId, message) {
  console.log(`Reply to ${userId}: ${message}`);
  // ตรงนี้ต่อ LINE Messaging API ส่งข้อความจริง
}

app.listen(3000, () => console.log('Bot running'));
