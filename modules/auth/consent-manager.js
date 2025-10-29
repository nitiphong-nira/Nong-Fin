const LineManager = require('../core/line-manager');
const SheetsManager = require('./sheets'); // ✅ เพิ่ม Google Sheets
const { createConsentMessage } = require('../messages/flex-consent'); // ✅ เพิ่ม Rich Message

class ConsentManager {
  constructor() {
    this.sheetsManager = new SheetsManager(); // ✅ ใช้ Google Sheets แทน Map
  }

  // ✅ ลบ method เก่า แล้วใช้แบบนี้แทน
  async checkConsentResponse(text) {
    const response = text.trim();
    if (response === 'ยินยอม') return 'accepted';
    if (response === 'ไม่ยินยอม') return 'rejected';
    return 'invalid'; // ✅ ตรวจจับคำตอบผิด
  }

  async handleUserMessage(userId, userMessage, replyToken) {
    console.log(`🔍 ตรวจสอบ user ${userId}: ${userMessage}`);
    
    // ✅ ตรวจสอบจาก Google Sheets แทน memory
    const hasConsented = await this.sheetsManager.checkUserConsent(userId);
    
    if (!hasConsented) {
      return await this.handleNewUser(userId, userMessage, replyToken);
    } else {
      return await this.handleExistingUser(userId, userMessage, replyToken);
    }
  }

  async handleNewUser(userId, userMessage, replyToken) {
    const consentResult = this.checkConsentResponse(userMessage);
    
    if (consentResult === 'accepted') {
      // ✅ บันทึกการยินยอมใน Google Sheets
      await this.sheetsManager.saveUserConsent(userId, 'ยินยอม');
      
      // ✅ ส่ง Rich Menu ทันที
      await LineManager.sendRichMenu(userId);
      
      // ✅ ขอข้อมูลส่วนตัว
      await this.requestPersonalInfo(replyToken);
      
      console.log(`✅ User ${userId} ยินยอมแล้ว`);
      return 'accepted';
      
    } else if (consentResult === 'rejected') {
      // ✅ บันทึกการไม่ยินยอมใน Google Sheets
      await this.sheetsManager.saveUserConsent(userId, 'ไม่ยินยอม');
      await LineManager.sendTextMessage(replyToken, 'ขอบคุณที่ให้ความสนใจ 😊');
      console.log(`❌ User ${userId} ไม่ยินยอม`);
      return 'rejected';
      
    } else {
      // ✅ ส่ง Rich Message แทน text ธรรมดา
      await LineManager.sendFlexMessage(replyToken, createConsentMessage());
      console.log(`📝 ส่ง Consent Rich Message ให้ ${userId}`);
      return 'sent_consent';
    }
  }

  async handleExistingUser(userId, userMessage, replyToken) {
    // ✅ ตรวจสอบอีกครั้งจาก Google Sheets
    const hasConsented = await this.sheetsManager.checkUserConsent(userId);
    
    if (!hasConsented) {
      await LineManager.sendTextMessage(replyToken, 'ขออภัย คุณไม่ยินยอมการใช้บริการ');
      return 'rejected_user';
    }
    
    // ✅ ส่ง Rich Menu สำหรับผู้ใช้ที่ยินยอมแล้ว
    await LineManager.sendRichMenu(userId);
    return 'consented_user';
  }

  async requestPersonalInfo(replyToken) {
    // ✅ ส่งข้อความขอข้อมูลส่วนตัว
    const message = {
      type: 'text',
      text: '📝 กรุณากรอกข้อมูลส่วนตัว\nรูปแบบ: ชื่อ นามสกุล อีเมล\nตัวอย่าง: สมชาย ใจดี somchai@email.com'
    };
    await LineManager.sendMessage(replyToken, message);
  }

  async hasUserConsented(userId) {
    // ✅ ตรวจสอบจาก Google Sheets
    return await this.sheetsManager.checkUserConsent(userId);
  }
}

module.exports = ConsentManager;
