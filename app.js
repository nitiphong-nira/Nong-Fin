import express from 'express';
import bodyParser from 'body-parser';
import lineRouter from './modules/line.js';

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

// Webhook route - ทั้งสองแบบเพื่อความชัวร์
app.post('/webhook', lineRouter);

// ✅ สำรอง: Route โดยตรงถ้า lineRouter มีปัญหา
app.post('/webhook', (req, res) => {
  console.log('📩 Direct webhook called');
  res.status(200).json({ status: 'OK' });
});

export default app;
