const express = require('express');
const { MessageRouter } = require('./modules/core/router'); // ← เพิ่มบรรทัดนี้

const app = express();
const port = process.env.PORT || 8080;

const messageRouter = new MessageRouter(); // ← เพิ่มบรรทัดนี้

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: '✅ บอททำงานปกติ' });
});

app.post('/webhook', async (req, res) => {
  try {
    const events = req.body.events;
    
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        await messageRouter.handleMessage(event); // ← ใช้ router
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).end();
  }
});

app.listen(port, () => {
  console.log(`🚀 บอทเริ่มทำงานที่พอร์ต ${port}`);
});
