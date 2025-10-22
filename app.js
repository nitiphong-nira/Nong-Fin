import express from 'express';
import bodyParser from 'body-parser';
import lineRouter from './modules/line.js';

const app = express();
app.use(bodyParser.json());

// ✅ Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Nong-Fin Bot',
    timestamp: new Date().toISOString()
  });
});

// ✅ Webhook route (ไม่ซ้ำ)
app.post('/webhook', lineRouter);

export default app;
