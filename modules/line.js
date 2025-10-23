import express from 'express';
import axios from 'axios';

const router = express.Router();

// ฟังก์ชันส่งข้อความกลับไปยัง LINE
async function replyMessage(replyToken, message) {
  if (!process.env.CHANNEL_ACCESS_TOKEN) {
    console.warn('⚠️ Missing CHANNEL_ACCESS_TOKEN');
    return;
  }

  try {
    await axios.post(
      'https://api.line.me/v2/bot/message/reply',
      {
        replyToken,
        messages: [{ type: 'text', text: message }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );
    console.log('✅ Reply sent');
  } catch (error) {
    console.error('❌ LINE API error:', error.response?.data || error.message);
  }
}

// Webhook Route หลัก
router.post('/', async (req, res) => {
  // ตอบกลับทันที
  res.status(200).json({ status: 'OK' });

  const events = req.body.events || [];
  console.log(`📩 Received ${events.length} event(s)`);

  for (const event of events) {
    try {
      if (event.type === 'message' && event.message?.type === 'text') {
        await handleMessage(event);
      }
    } catch (err) {
      console.error('❌ Error:', err.message);
    }
  }
});

// จัดการข้อความ
async function handleMessage(event) {
  const userMsg = event.message.text.trim();
  console.log(`💬 User: ${userMsg}`);

  // ตอบกลับแบบง่ายๆ
  await replyMessage(event.replyToken, `ได้รับข้อความ: "${userMsg}" 👍`);
}

export default router;
