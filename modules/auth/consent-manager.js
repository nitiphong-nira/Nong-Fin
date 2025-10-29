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
      
      // ✅ ใช้ method จริงจาก line-manager ที่เพิ่งสร้าง
      await LineManager.linkRichMenuToUser(userId);
      
      await this.requestPersonalInfo(replyToken);
      this.waitingForUserInfo.add(userId);
      
      console.log(`✅ User ${userId} ยินยอมแล้ว - รอข้อมูลส่วนตัว`);
      return 'accepted_awaiting_info';
      
    } else if (userMessage === 'ไม่ยินยอม') {
      await this.sheetsManager.saveConsent(userId, 'ไม่ยินยอม');
      await LineManager.sendTextMessage(replyToken, 'ขอบคุณที่ให้ความสนใจ 😊');
      return 'rejected';
      
    } else {
      // ✅ ใช้ Flex Message แทน fallback
      await LineManager.sendConsentFlexMessage(replyToken);
      return 'sent_consent';
    }
  }

  async handleExistingUser(userId, userMessage, replyToken) {
    // ✅ ต้องเพิ่ม method นี้ (หายไป)
    const userData = await this.sheetsManager.getUserById(userId);
    const hasConsented = userData && userData.consent === 'ยินยอม';
    
    if (!hasConsented) {
      await LineManager.sendTextMessage(replyToken, 'ขออภัย คุณไม่ยินยอมการใช้บริการ');
      return 'rejected_user';
    }
    
    // ✅ ส่ง Rich Menu สำหรับผู้ใช้ที่ยินยอมแล้ว
    await LineManager.linkRichMenuToUser(userId);
    return 'consented_user';
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

  // ❌ ลบ method นี้ (ไม่ใช้แล้ว)
  // async sendFallbackConsentMessage(replyToken) { ... }

  // ❌ ลบ method นี้ (ใช้ LineManager.linkRichMenuToUser โดยตรง)
  // async sendToRichMenu(userId) { ... }

  async requestPersonalInfo(replyToken) {
    await LineManager.sendTextMessage(replyToken,
      '📝 กรุณากรอกข้อมูลส่วนตัว\nรูปแบบ: ชื่อ นามสกุล อีเมล\nตัวอย่าง: สมชาย ใจดี somchai@email.com'
    );
  }

  // ✅ เพิ่ม method ตรวจสอบการยินยอม
  async hasUserConsented(userId) {
    const userData = await this.sheetsManager.getUserById(userId);
    return userData && userData.consent === 'ยินยอม';
  }
}

module.exports = ConsentManager;
