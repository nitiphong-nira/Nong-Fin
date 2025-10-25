const line = require('@line/bot-sdk');
const config = require('../../config/line-config');  // ← ใช้ config ไฟล์
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
