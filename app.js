import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Nong-Fin Bot',
    timestamp: new Date().toISOString()
  });
});

// ✅ Webhook route โดยตรง (ไม่ใช้ lineRouter)
app.post('/webhook', (req, res) => {
  console.log('📩 Webhook received - LINE verification');
  
  // ✅ ส่ง 200 OK ทันที
  res.status(200).json({ status: 'OK' });
  
  // Process events ในพื้นหลัง
  const events = req.body.events || [];
  console.log(`Processing ${events.length} events`);
});

export default app;
