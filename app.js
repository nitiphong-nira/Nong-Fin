import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ status: 'OK', service: 'Nong-Fin Bot' });
});

// ✅ ต้องมีบรรทัดนี้
app.post('/webhook', (req, res) => {
  console.log('📩 Webhook received');
  res.status(200).json({ status: 'OK' });
});

export default app;
