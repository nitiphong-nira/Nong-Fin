import express from 'express';
import bodyParser from 'body-parser';
import lineRouter from './modules/line.js'; // นำกลับมาใช้

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

// ✅ มีเพียง SINGLE webhook route
app.post('/webhook', lineRouter);

export default app;
