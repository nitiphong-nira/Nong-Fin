import express from 'express';

const router = express.Router();

// ✅ ต้องมี method POST ที่ path '/'
router.post('/', async (req, res) => {
  try {
    console.log('📩 Received webhook request');
    
    // ✅ สำคัญ: ส่ง 200 OK ทันที
    res.status(200).json({ status: 'OK' });
    
    // Process events ในพื้นหลัง
    const events = req.body.events || [];
    for (const event of events) {
      console.log('Processing event:', event.type);
      // Your bot logic here
    }
    
  } catch (error) {
    console.error('Webhook error:', error);
    // ✅ ถึงมี error ก็ส่ง 200 OK
    res.status(200).json({ status: 'OK' });
  }
});

export default router;
