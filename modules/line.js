import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const events = req.body.events || [];
    for (const event of events) {
      console.log('📩 Received LINE event:', event.type);
      // respond or log later
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ LINE webhook error:', err);
    res.status(500).end();
  }
});

export default router;
