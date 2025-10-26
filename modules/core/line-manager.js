const axios = require('axios');

class LineManager {
  static async sendMessage(replyToken, message) {
    try {
      const response = await axios.post(
        'https://api.line.me/v2/bot/message/reply',
        {
          replyToken: replyToken,
          messages: Array.isArray(message) ? message : [message]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ ส่งข้อความสำเร็จ');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ ส่งข้อความไม่สำเร็จ:', error.response?.data);
      return { success: false, error: error.message };
    }
  }

  static async sendTextMessage(replyToken, text) {
    return await this.sendMessage(replyToken, {
      type: 'text',
      text: text
    });
  }

  static async sendFlexMessage(replyToken, flexContent) {
    return await this.sendMessage(replyToken, {
      type: 'flex',
      altText: 'Flex Message',
      contents: flexContent
    });
  }

  static async getUserProfile(userId) {
    try {
      const response = await axios.get(
        `https://api.line.me/v2/bot/profile/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
          }
        }
      );
      return { success: true, profile: response.data };
    } catch (error) {
      console.error('รับข้อมูลผู้ใช้ไม่สำเร็จ:', error.response?.data);
      return { success: false, profile: null };
    }
  }
}

module.exports = LineManager;
