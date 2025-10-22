import express from 'express';
import bodyParser from 'body-parser';
import lineRouter from './modules/line.js';

const app = express();
app.use(bodyParser.json());

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Nong-Fin Bot',
    timestamp: new Date().toISOString()
  });
});

// ✅ ต้องมี route นี้แน่นอน!
app.post('/webhook', lineRouter);

// ✅ เพิ่ม fallback route สำหรับ 404
app.use('*', (req, res) => {
  res.status(200).send('OK'); // LINE ต้องการ 200 เสมอ
});

export default app;
