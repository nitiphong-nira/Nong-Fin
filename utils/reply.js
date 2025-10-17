// utils/reply.js
const axios = require('axios');

const LINE_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

if (!LINE_TOKEN) {
  console.error('❌ CHANNEL_ACCESS_TOKEN is not set in environment variables!');
}

async function replyMessage(userId, message) {
  if (!LINE_TOKEN) {
    console.warn('⚠️ replyMessage skipped because LINE token missing');
    return;
  }

  try {
    const payload = {
      to: userId,
      messages: [{ type: 'text', text: message }],
    };
    const res = await axios.post('https://api.line.me/v2/bot/message/push', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_TOKEN}`,
      },
      timeout: 8000,
    });
    return res.data;
  } catch (err) {
    // Log the error but do not throw (prevents crashing)
    console.error('❌ Error sending message:', err.response?.data || err.message);
  }
}

module.exports = { replyMessage };
