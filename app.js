const express = require('express');
const line = require('@line/bot-sdk');

const app = express();
const port = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: '✅ บอททำงานปกติ', timestamp: new Date().toISOString() });
});

app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;
    console.log('📨 Received events:', events.length);
    
    for (const event of events) {
      if (event.type === 'message') {
        console.log('💬 Message:', event.message.text);
        
        // ส่ง Flex Consent กลับไป
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
  console.log(`🚀 บอทเริ่มทำงานที่พอร์ต ${port}`);
  console.log('✅ Using direct config values');
});
