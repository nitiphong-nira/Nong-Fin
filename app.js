import express from 'express';
import bodyParser from 'body-parser';
import lineRouter from './modules/line.js';

const app = express();
app.use(bodyParser.json());

// Simple health check route for Railway
app.get('/', (req, res) => res.send('Nong-Fin bot running ✅'));

// Line Webhook route
app.post('/webhook', lineRouter);

export default app;
