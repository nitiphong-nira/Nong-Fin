const express = require('express');
const line = require('@line/bot-sdk');

const app = express();
const port = process.env.PORT || 3000;

// ตั้งค่า Line
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);

// ✅ นำเข้า Router
const { MessageRouter } = require('./modules/core/router');
const messageRouter = new MessageRouter();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    status: '✅ บอททำงานปกติ',
    service: 'Nong Fin Bot', 
    timestamp: new Date().toISOString()
  });
});

// Webhook - ใช้ Router จัดการ
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    console.log('📨 Received webhook');
    const events = req.body.events;
    
    // Process events
    for (const event of events) {
      if (event.type === 'message') {
        await messageRouter.handleMessage(event);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).end();
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Config loaded: { hasToken: true, hasSecret: true }`);
  console.log(`🚀 บอทเริ่มทำงานที่พอร์ต ${port}`);
});
