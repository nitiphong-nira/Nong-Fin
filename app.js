const express = require('express');
const { MessageRouter } = require('./modules/core/router'); // ✅ ใช้ { } ถูกต้องแล้ว

const app = express();
const port = process.env.PORT || 8080;

// ✅ เพิ่ม try-catch ให้ router initialization
let messageRouter;
try {
  messageRouter = new MessageRouter();
  console.log('✅ MessageRouter initialized successfully');
} catch (error) {
  console.error('❌ MessageRouter initialization failed:', error);
  // Fallback router
  messageRouter = {
    handleMessage: async (event) => {
      console.log('⚠️  Fallback handler');
      const LineManager = require('./modules/core/line-manager');
      await LineManager.sendTextMessage(event.replyToken, '🚧 บอทกำลังปรับปรุงระบบ');
    }
  };
}

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: '✅ บอททำงานปกติ' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

app.post('/webhook', async (req, res) => {
  try {
    console.log('📨 Received webhook');
    const events = req.body.events;
    
    if (events && Array.isArray(events)) {
      for (const event of events) {
        await messageRouter.handleMessage(event);
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(200).json({ success: false }); // ✅ ส่ง 200 ให้ Line เสมอ
  }
});

app.listen(port, () => {
  console.log(`🚀 บอทเริ่มทำงานที่พอร์ต ${port}`);
});
