const LineManager = require('../core/line-manager');
const SheetsManager = require('./sheets');

class ConsentManager {
  constructor() {
    this.sheetsManager = new SheetsManager();
    this.waitingForUserInfo = new Set();
  }

  async handleUserMessage(userId, userMessage, replyToken) {
    console.log(`🔍 ตรวจสอบ user ${userId}: ${userMessage}`);
    
    // ✅ เปลี่ยนเป็น method ที่มีอยู่ใน sheets.js
    const userData = await this.sheetsManager.getUserById(userId);
    const hasConsented = userData && userData.consent === 'ยินยอม';
    
    if (!hasConsented) {
      return await this.handleNewUser(userId, userMessage, replyToken);
    } else {
      if (this.waitingForUserInfo.has(userId)) {
        return await this.handleUserInfoInput(userId, userMessage, replyToken);
      }
      return await this.handleExistingUser(userId, userMessage, replyToken);
    }
  }

  async handleNewUser(userId, userMessage, replyToken) {
    if (userMessage === 'ยินยอม') {
      // ✅ ใช้ method ที่มีอยู่
      await this.sheetsManager.saveConsent(userId, 'ยินยอม');
      
      // ✅ ใช้ method ที่มีอยู่ใน line-manager (หรือสร้างใหม่)
      await this.sendToRichMenu(userId);
      
      await this.requestPersonalInfo(replyToken);
      this.waitingForUserInfo.add(userId);
      
      console.log(`✅ User ${userId} ยินยอมแล้ว - รอข้อมูลส่วนตัว`);
      return 'accepted_awaiting_info';
      
    } else if (userMessage === 'ไม่ยินยอม') {
      await this.sheetsManager.saveConsent(userId, 'ไม่ยินยอม');
      await LineManager.sendTextMessage(replyToken, 'ขอบคุณที่ให้ความสนใจ 😊');
      return 'rejected';
      
    } else {
      // ✅ ใช้ fallback จนกว่าจะสร้าง flex-consent.js
      await this.sendFallbackConsentMessage(replyToken);
      return 'sent_consent';
    }
  }

  async handleUserInfoInput(userId, userMessage, replyToken) {
    // ✅ ย้าย method มาอยู่ที่นี่
    const userProfile = this.parseUserInfo(userMessage);
    
    if (userProfile) {
      // ✅ ใช้ method ที่มีอยู่
      await this.sheetsManager.saveUserProfile(userId, userProfile);
      this.waitingForUserInfo.delete(userId);
      
      await LineManager.sendTextMessage(replyToken, 
        `✅ บันทึกข้อมูลเรียบร้อย!\nชื่อ: ${userProfile.firstName} ${userProfile.lastName}\nอีเมล: ${userProfile.email}`
      );
      return 'info_saved';
    } else {
      await LineManager.sendTextMessage(replyToken,
        '❌ กรุณากรอกข้อมูลให้ครบถ้วน\nรูปแบบ: ชื่อ นามสกุล อีเมล\nตัวอย่าง: สมชาย ใจดี somchai@email.com'
      );
      return 'invalid_info_format';
    }
  }

  // ✅ เพิ่ม method ใหม่
  parseUserInfo(text) {
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 3) {
      return {
        firstName: parts[0],
        lastName: parts[1],
        email: parts[2]
      };
    }
    return null;
  }

  // ✅ Fallback จนกว่าจะมี flex-consent.js
  async sendFallbackConsentMessage(replyToken) {
    await LineManager.sendTextMessage(replyToken,
      '📜 **กรุณายินยอมให้เก็บข้อมูลส่วนตัว**\n\n' +
      'คุณยินยอมหรือไม่?\n\n' +
      'พิมพ์ "ยินยอม" หรือ "ไม่ยินยอม"'
    );
  }

  // ✅ ส่งไป Rich Menu (ต้องสร้าง method นี้ใน line-manager)
  async sendToRichMenu(userId) {
    // ชั่วคราวส่งข้อความแทน
    await LineManager.sendTextMessageToUser(userId, '🎉 ยินดีต้อนรับสู่ Nong Fin!');
  }

  async requestPersonalInfo(replyToken) {
    await LineManager.sendTextMessage(replyToken,
      '📝 กรุณากรอกข้อมูลส่วนตัว\nรูปแบบ: ชื่อ นามสกุล อีเมล\nตัวอย่าง: สมชาย ใจดี somchai@email.com'
    );
  }
}

module.exports = ConsentManager;
