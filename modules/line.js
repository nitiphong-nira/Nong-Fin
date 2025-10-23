import express from 'express';
import { handleConsentFlow, hasUserConsented, sendConsentForm } from './consent.js';

const router = express.Router();

router.post('/', async (req, res) => {
  res.status(200).json({ status: 'OK' });
  const events = req.body.events || [];

  for (const event of events) {
    try {
      if (event.type === 'message' && event.message?.type === 'text') {
        await handleMessage(event);
      }
      if (event.type === 'follow') {
        await sendConsentForm(event.replyToken, event.source.userId);
      }
    } catch (err) {
      console.error('❌ Error:', err.message);
    }
  }
});

async function handleMessage(event) {
  const userMsg = event.message.text.trim();
  const userId = event.source.userId;
  await handleConsentFlow(event, userMsg, userId);
}

export default router;
