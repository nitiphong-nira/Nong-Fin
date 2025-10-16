// utils/reply.js
const axios = require('axios');

const LINE_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

async function replyMessage(userId, message) {
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
