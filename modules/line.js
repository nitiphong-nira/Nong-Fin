import express from 'express';
import { handleConsent } from './consent.js';
import { replyMessage } from './utils.js';

const router = express.Router();

router.post('/', async (req, res) => {
  res.status(200).json({ status: 'OK' });

  const events = req.body.events || [];
  
  for (const event of events) {
    try {
      if (event.type === 'message' && event.message?.type === 'text') {
        const userMsg = event.message.text.trim();
        const userId = event.source.userId;
        
        await handleConsent(event, userMsg, userId);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
});

export default router;
