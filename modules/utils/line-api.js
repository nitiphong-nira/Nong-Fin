// modules/utils/line-api.js
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);

class LineAPI {
  static async replyMessage(replyToken, message) {
    try {
      return await client.replyMessage(replyToken, message);
    } catch (error) {
      console.error('ส่งข้อความไม่สำเร็จ:', error);
      throw error;
    }
  }
}

module.exports = LineAPI;
