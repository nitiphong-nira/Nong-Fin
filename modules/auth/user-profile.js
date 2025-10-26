const LineManager = require('../core/line-manager');

// ⚠️ ไฟล์นี้ตอนนี้เป็น "alias" ของ LineManager
// เพื่อให้โค้ดเก่าที่ import จากที่นี่ยังทำงานได้

class LineAPI {
  static async replyMessage(replyToken, message) {
    console.log('📤 [LineAPI] ส่งข้อความผ่าน LineManager');
    return await LineManager.sendMessage(replyToken, message);
  }

  static async getUserProfile(userId) {
    console.log('👤 [LineAPI] รับข้อมูลผู้ใช้ผ่าน LineManager');
    const result = await LineManager.getUserProfile(userId);
    return result.success ? result.profile : null;
  }

  static async sendFlexMessage(replyToken, flexContent) {
    console.log('🎨 [LineAPI] ส่ง Flex Message ผ่าน LineManager');
    return await LineManager.sendFlexMessage(replyToken, flexContent);
  }

  static async sendTextMessage(replyToken, text) {
    console.log('💬 [LineAPI] ส่งข้อความธรรมดาผ่าน LineManager');
    return await LineManager.sendTextMessage(replyToken, text);
  }
}

module.exports = LineAPI;
