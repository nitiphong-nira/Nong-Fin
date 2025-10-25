const { ConsentManager } = require('../auth/consent');
const LineAPI = require('../utils/line-api');

class MessageRouter {
  constructor() {
    this.consentManager = new ConsentManager();
    this.botPaused = false;
    this.ADMIN_ID = process.env.ADMIN_LINE_ID;
  }

  async handleMessage(event) {
    const { replyToken, message, source } = event;
    const userId = source.userId;
    const userMessage = message.text;

    // ตรวจสอบคำสั่ง Admin
    if (userMessage === '!หยุด' && userId === this.ADMIN_ID) {
      this.botPaused = true;
      await LineAPI.replyMessage(replyToken, {
        type: 'text',
        text: '🛑 บอทหยุดทำงานชั่วคราว'
      });
      return;
    }

    if (userMessage === '!เริ่ม' && userId === this.ADMIN_ID) {
      this.botPaused = false;
      await LineAPI.replyMessage(replyToken, {
        type: 'text', 
        text: '✅ บอทเริ่มทำงานปกติ'
      });
      return;
    }

    // ตรวจสอบการหยุดชั่วคราว
    if (this.botPaused && userId !== this.ADMIN_ID) {
      await LineAPI.replyMessage(replyToken, {
        type: 'text',
        text: '⏸️ บอทกำลังปิดปรับปรุง กรุณารอสักครู่'
      });
      return;
    }

    // ตรวจสอบการยินยอม
    const hasConsent = await this.consentManager.checkConsent(userId);
    
    if (!hasConsent) {
      // ยังไม่ยินยอม - ส่ง PDPA Consent
      await this.consentManager.requestConsent(replyToken);
    } else {
      // ยินยอมแล้ว - แสดงเมนูหรือประมวลผลข้อความ
      await this.handleConsentedUser(event);
    }
  }

  async handleConsentedUser(event) {
    const { replyToken, message } = event;
    
    // ส่งเมนู Rich Menu (Line จะจัดการให้อัตโนมัติ)
    // หรือประมวลผลข้อความตาม features
    await LineAPI.replyMessage(replyToken, {
      type: 'text',
      text: 'ยินดีต้อนรับ! กรุณาเลือกเมนูด้านล่าง'
    });
  }
}

module.exports = { MessageRouter };
