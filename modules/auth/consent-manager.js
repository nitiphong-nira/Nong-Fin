const LineManager = require('../core/line-manager');

class ConsentManager {
  constructor() {
    this.userConsentDB = new Map();
  }

  checkConsentResponse(text) {
    const response = text.toLowerCase().trim();
    if (['ยินยอม', 'yes', 'y', 'ตกลง', 'ย'].includes(response)) return 'accepted';
    if (['ไม่ยินยอม', 'no', 'n', 'ปฏิเสธ', 'ไม่'].includes(response)) return 'rejected';
    return 'other';
  }

  async handleUserMessage(userId, userMessage, replyToken) {
    console.log(`🔍 ตรวจสอบ user ${userId}: ${userMessage}`);
    
    if (!this.userConsentDB.has(userId)) {
      return await this.handleNewUser(userId, userMessage, replyToken);
    } else {
      return await this.handleExistingUser(userId, userMessage, replyToken);
    }
  }

  async handleNewUser(userId, userMessage, replyToken) {
    const consentResult = this.checkConsentResponse(userMessage);
    
    if (consentResult === 'accepted') {
      this.userConsentDB.set(userId, { consented: true, timestamp: new Date() });
      await LineManager.sendTextMessage(replyToken, '🎉 ขอบคุณที่ยินยอม! กรุณาเลือกเมนูที่ต้องการด้านล่าง');
      console.log(`✅ User ${userId} ยินยอมแล้ว`);
      return 'accepted';
      
    } else if (consentResult === 'rejected') {
      this.userConsentDB.set(userId, { consented: false, timestamp: new Date() });
      await LineManager.sendTextMessage(replyToken, 'ขอบคุณที่ให้ความสนใจ 😊');
      console.log(`❌ User ${userId} ไม่ยินยอม`);
      return 'rejected';
      
    } else {
      // ส่ง Consent Message
      const consentText = 
        `📜 **นโยบายความเป็นส่วนตัว (PDPA Consent)**\n\n` +
        `น้องฟินจะเก็บและใช้ข้อมูลต่อไปนี้เพื่อให้บริการ:\n` +
        `• ข้อความที่คุณพิมพ์ในแชท\n` +
        `• ข้อมูลผู้ใช้ (LINE userId)\n` +
        `• คำตอบในการคำนวณหรือวางแผนการเงิน\n\n` +
        `ข้อมูลจะถูกเก็บไว้เพื่อ:\n` +
        `✅ ให้คำแนะนำด้านการเงินส่วนบุคคล\n` +
        `✅ ปรับปรุงบริการและประสบการณ์การใช้งาน\n` +
        `❌ จะไม่เปิดเผยแก่บุคคลที่สามโดยไม่ได้รับอนุญาต\n\n` +
        `อ่านรายละเอียดนโยบายเต็มได้ที่:\n` +
        `👉 https://www.notion.so/Privacy-Policy-28b3d2318ce980b98771db7919f6ff20?source=copy_link\n\n` +
        `คุณยินยอมให้น้องฟินเก็บข้อมูลส่วนตัวเพื่อให้บริการหรือไม่?\n\n` +
        `ถ้ายินยอมให้ พิมพ์ "Y"\n` +
        `หรือถ้าไม่ยินยอมให้ พิมพ์ "N"`;
      
      await LineManager.sendTextMessage(replyToken, consentText);
      console.log(`📝 ส่ง Consent Message ให้ ${userId}`);
      return 'sent_consent';
    }
  }

  async handleExistingUser(userId, userMessage, replyToken) {
    const userData = this.userConsentDB.get(userId);
    
    if (!userData.consented) {
      await LineManager.sendTextMessage(replyToken, 'ขออภัย คุณไม่ยินยอมการใช้บริการ');
      return 'rejected_user';
    }
    
    return 'consented_user';
  }

  hasUserConsented(userId) {
    const userData = this.userConsentDB.get(userId);
    return userData ? userData.consented : false;
  }
}

module.exports = ConsentManager;
