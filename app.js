const express = require('express');
const line = require('@line/bot-sdk');

const app = express();
const port = process.env.PORT || 3000;

// ตรวจสอบก่อนใช้
if (!process.env.LINE_CHANNEL_SECRET) {
  console.error('❌ LINE_CHANNEL_SECRET is missing');
  process.exit(1);
}

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

console.log('✅ Config loaded:', {
  hasToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
  hasSecret: !!process.env.LINE_CHANNEL_SECRET
});

// เมื่อมีคนส่งข้อความมา
app.post('/webhook', line.middleware(config), (req, res) => {
  req.body.events.forEach(event => {
    if (event.type === 'message') {
      console.log('ได้รับข้อความ:', event.message.text);
    }
  });
  res.json({ success: true });
});

// เริ่มทำงาน
app.listen(port, () => {
  console.log(`บอทเริ่มทำงานที่พอร์ต ${port}`);
});
