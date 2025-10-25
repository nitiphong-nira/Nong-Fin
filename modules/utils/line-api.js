const line = require('@line/bot-sdk');
const config = require('../../config/line-config');

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

  static async getUserProfile(userId) {
    try {
      return await client.getProfile(userId);
    } catch (error) {
      console.error('ขอข้อมูล user ไม่สำเร็จ:', error);
      return null;
    }
  }
}

module.exports = LineAPI;
