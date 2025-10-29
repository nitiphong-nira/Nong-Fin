const LineManager = require('../core/line-manager');
const SheetsManager = require('./sheets');

class ConsentManager {
  constructor() {
    this.sheetsManager = new SheetsManager();
    this.waitingForUserInfo = new Set(); // ✅ Track users who need to provide info
  }

  async handleUserMessage(userId, userMessage, replyToken) {
    console.log(`🔍 ตรวจสอบ user ${userId}: ${userMessage}`);
    
    // ✅ ตรวจสอบจาก Google Sheets จริง
    const hasConsented = await this.sheetsManager.checkUserConsent(userId);
    
    if (!hasConsented) {
      return await this.handleNewUser(userId, userMessage, replyToken);
    } else {
      // ✅ ถ้ายินยอมแล้ว แต่กำลังรอข้อมูลส่วนตัว
      if (this.waitingForUserInfo.has(userId)) {
        return await this.handleUserInfoInput(userId, userMessage, replyToken);
      }
      return await this.handleExistingUser(userId, userMessage, replyToken);
    }
  }

  async handleNewUser(userId, userMessage, replyToken) {
    // ✅ ตรวจสอบเฉพาะ "ยินยอม" หรือ "ไม่ยินยอม" เท่านั้น
    if (userMessage === 'ยินยอม') {
      await this.sheetsManager.saveConsent(userId, 'ยินยอม');
      
      // ✅ ส่ง Rich Menu ทันที
      await LineManager.sendRichMenu(userId);
      
      // ✅ ขอข้อมูลส่วนตัว & track user
      await this.requestPersonalInfo(replyToken);
      this.waitingForUserInfo.add(userId);
      
      console.log(`✅ User ${userId} ยินยอมแล้ว - รอข้อมูลส่วนตัว`);
      return 'accepted_awaiting_info';
      
    } else if (userMessage === 'ไม่ยินยอม') {
      await this.sheetsManager.saveConsent(userId, 'ไม่ยินยอม');
      await LineManager.sendTextMessage(replyToken, 'ขอบคุณที่ให้ความสนใจ 😊');
      console.log(`❌ User ${userId} ไม่ยินยอม`);
      return 'rejected';
      
    } else {
      // ✅ ส่ง Rich Message ที่ล็อคคำตอบเท่านั้น
      await this.sendConsentRichMessage(replyToken);
      return 'sent_consent';
    }
  }

  async handleUserInfoInput(userId, userMessage, replyToken) {
    // ✅ พยายามแยกข้อมูลส่วนตัว
    const userProfile = this.sheetsManager.parseUserInfo(userMessage);
    
    if (userProfile) {
      // ✅ บันทึกข้อมูลส่วนตัว
      await this.sheetsManager.saveUserProfile(userId, userProfile);
      this.waitingForUserInfo.delete(userId);
      
      await LineManager.sendTextMessage(replyToken, 
        `✅ บันทึกข้อมูลเรียบร้อย!\nชื่อ: ${userProfile.firstName} ${userProfile.lastName}\nอีเมล: ${userProfile.email}`
      );
      return 'info_saved';
    } else {
      // ✅ ข้อมูลไม่ครบ - ส่งตัวอย่างใหม่
      await LineManager.sendTextMessage(replyToken,
        '❌ กรุณากรอกข้อมูลให้ครบถ้วน\nรูปแบบ: ชื่อ นามสกุล อีเมล\nตัวอย่าง: สมชาย ใจดี somchai@email.com'
      );
      return 'invalid_info_format';
    }
  }

  async sendConsentRichMessage(replyToken) {
    // ✅ ต้องสร้างไฟล์ flex-consent.js สำหรับส่วนนี้
    const { createConsentMessage } = require('../messages/flex-consent');
    await LineManager.sendFlexMessage(replyToken, createConsentMessage());
  }

  async requestPersonalInfo(replyToken) {
    await LineManager.sendTextMessage(replyToken,
      '📝 กรุณากรอกข้อมูลส่วนตัว\nรูปแบบ: ชื่อ นามสกุล อีเมล\nตัวอย่าง: สมชาย ใจดี somchai@email.com'
    );
  }
}

module.exports = ConsentManager;
