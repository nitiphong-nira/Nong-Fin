const express = require('express');
const MessageRouter = require('./modules/core/router'); // ✅ ลบ { }

const app = express();
const port = process.env.PORT || 8080;

// ✅ เพิ่ม error handling
let messageRouter;
try {
  messageRouter = new MessageRouter();
  console.log('✅ MessageRouter initialized successfully');
} catch (error) {
  console.error('❌ MessageRouter initialization failed:', error);
  // สร้าง fallback router
  messageRouter = {
    handleMessage: async (event) => {
      console.log('⚠️  Fallback handler for event:', event.type);
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
    timestamp: new Date().toISOString(),
    service: 'Nong Fin Bot'
  });
});

app.post('/webhook', async (req, res) => {
  try {
    console.log('📨 Received webhook');
    const events = req.body.events;
    
    if (events && Array.isArray(events)) {
      for (const event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
          await messageRouter.handleMessage(event);
        }
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ success: false, error: error.message }); // ✅ ส่ง 200 ให้ Line
  }
});

app.listen(port, () => {
  console.log(`🚀 บอทเริ่มทำงานที่พอร์ต ${port}`);
});

// ✅ Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
