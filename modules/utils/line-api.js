const line = require('@line/bot-sdk');

// ใช้ config จาก environment variables โดยตรง
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);

class LineAPI {
  static async replyMessage(replyToken, message) {
    try {
      console.log('📤 Sending message:', message);
      return await client.replyMessage(replyToken, message);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }
}

module.exports = LineAPI;
