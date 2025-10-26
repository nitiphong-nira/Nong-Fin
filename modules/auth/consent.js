const LineManager = require('../core/line-manager');
const { createConsentFlex } = require('../messages/flex-consent');

class ConsentManager {
  constructor() {
    this.userConsentDB = new Map(); // ชั่วคราวแทน Google Sheets
  }

  checkConsentResponse(text) {
    const response = text.toLowerCase().trim();
    if (['ยินยอม', 'yes', 'y', 'ตกลง'].includes(response)) return 'accepted';
    if (['ไม่ยินยอม', 'no', 'n', 'ปฏิเสธ'].includes(response)) return 'rejected';
    return 'other';
  }

  async handleUserMessage(userId, userMessage, replyToken) {
    console.log(`🔍 ตรวจสอบ user ${userId}: ${userMessage}`);
    
    // ตรวจสอบว่ายืนยันแล้วหรือยัง
    if (!this.userConsentDB.has(userId)) {
      return await this.handleNewUser(userId, userMessage, replyToken);
    } else {
      return await this.handleExistingUser(userId, userMessage, replyToken);
    }
  }

  async handleNewUser(userId, userMessage, replyToken) {
    const consentResult = this.checkConsentResponse(userMessage);
    
    if (consentResult === 'accepted') {
      // ยินยอมแล้ว
      this.userConsentDB.set(userId, { consented: true, timestamp: new Date() });
      await LineManager.sendTextMessage(replyToken, '🎉 ขอบคุณที่ยินยอม! กรุณาเลือกเมนูที่ต้องการด้านล่าง');
      console.log(`✅ User ${userId} ยินยอมแล้ว`);
      return 'accepted';
      
    } else if (consentResult === 'rejected') {
      // ไม่ยินยอม
      this.userConsentDB.set(userId, { consented: false, timestamp: new Date() });
      await LineManager.sendTextMessage(replyToken, 'ขอบคุณที่ให้ความสนใจ 😊');
      console.log(`❌ User ${userId} ไม่ยินยอม`);
      return 'rejected';
      
    } else {
      // ส่ง Consent Form
      const flexMessage = createConsentFlex();
      await LineManager.sendFlexMessage(replyToken, flexMessage);
      console.log(`📝 ส่ง Consent Form ให้ ${userId}`);
      return 'sent_consent';
    }
  }

  async handleExistingUser(userId, userMessage, replyToken) {
    const userData = this.userConsentDB.get(userId);
    
    if (!userData.consented) {
      // ไม่ยินยอมแต่ส่งข้อความมา
      await LineManager.sendTextMessage(replyToken, 'ขออภัย คุณไม่ยินยอมการใช้บริการ');
      return 'rejected_user';
    }
    
    // ยินยอมแล้ว - ส่งต่อให้ keyword handler
    console.log(`✅ User ${userId} ยินยอมแล้ว ส่งต่อให้ keyword handler`);
    return 'consented_user';
  }

  // ตรวจสอบว่ายินยอมแล้วหรือไม่
  hasUserConsented(userId) {
    const userData = this.userConsentDB.get(userId);
    return userData ? userData.consented : false;
  }
}

module.exports = ConsentManager;
