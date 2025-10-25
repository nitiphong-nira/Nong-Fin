const express = require('express');
// const line = require('@line/bot-sdk'); // ← ลบบรรทัดนี้ชั่วคราว

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: '✅ บอททำงานปกติ', timestamp: new Date().toISOString() });
});

// Webhook อย่างง่าย (ไม่ใช้ Line middleware ชั่วคราว)
app.post('/webhook', (req, res) => {
  console.log('📨 Received webhook (raw):', req.body);
  res.json({ success: true, message: 'Received' });
});

app.listen(port, () => {
  console.log(`🚀 บอทเริ่มทำงานที่พอร์ต ${port}`);
  console.log('🔍 Mode: Simple webhook (no Line SDK)');
});
