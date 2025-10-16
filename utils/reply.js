const axios = require('axios');

// ใช้ environment variable
const LINE_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

if (!LINE_TOKEN) {
  console.error('❌ CHANNEL_ACCESS_TOKEN is not set!');
}

async function replyMessage(userId, message) {
  if (!LINE_TOKEN) {
    console.warn('⚠️ Cannot send message, LINE_TOKEN missing');
    return;
  }

  try {
    await axios.post('https://api.line.me/v2/bot/message/push', {
      to: userId,
      messages: [{ type: 'text', text: message }],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_TOKEN}`,
      }
    });
  } catch (err) {
    console.error('❌ Error sending message:', err.response?.data || err.message);
  }
}

module.exports = { replyMessage };
