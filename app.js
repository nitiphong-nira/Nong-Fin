const express = require('express');
const line = require('@line/bot-sdk');

const app = express();
const port = process.env.PORT || 8080;

// ใช้ environment variables ธรรมดา
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

console.log('🔍 GCP Config check:', {
  hasToken: !!config.channelAccessToken,
  hasSecret: !!config.channelSecret
});

const client = new line.Client(config);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: '✅ บอททำงานปกติบน GCP',
    timestamp: new Date().toISOString() 
  });
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
