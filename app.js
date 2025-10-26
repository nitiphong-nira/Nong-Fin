const express = require('express');
// const line = require('@line/bot-sdk'); // ← ยังคอมเมนต์อยู่

const app = express();
const port = process.env.PORT || 8080;

// ตรวจสอบ environment variables
console.log('🔍 ENV Check:', {
  token: process.env.LINE_CHANNEL_ACCESS_TOKEN ? '✅ มี' : '❌ ไม่มี',
  secret: process.env.LINE_CHANNEL_SECRET ? '✅ มี' : '❌ ไม่มี',
  sheet: process.env.GOOGLE_SHEET_ID ? '✅ มี' : '❌ ไม่มี'
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: '✅ บอททำงานปกติ',
    env: {
      hasToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      hasSecret: !!process.env.LINE_CHANNEL_SECRET
    }
  });
});

app.post('/webhook', (req, res) => {
  console.log('📨 Received webhook');
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`🚀 บอทเริ่มทำงานที่พอร์ต ${port}`);
});

app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;
    console.log('📨 Received events:', events.length);
    
    for (const event of events) {
      if (event.type === 'message') {
        console.log('💬 Message:', event.message.text);
        
        // ส่ง Flex Consent
        const flexConsent = require('./modules/messages/flex-consent').createConsentFlex();
        await client.replyMessage(event.replyToken, flexConsent);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).end();
  }
});

app.listen(port, () => {
  console.log(`🚀 บอทเริ่มทำงานบน GCP ที่พอร์ต ${port}`);
});
