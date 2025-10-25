const { createConsentFlex } = require('../messages/flex-consent');
const LineAPI = require('../utils/line-api');

class MessageRouter {
  constructor() {
    this.botPaused = false;
    this.ADMIN_ID = process.env.ADMIN_LINE_ID;
  }

  async handleMessage(event) {
    const { replyToken, message, source } = event;
    const userId = source.userId;
    const userMessage = message.text;

    console.log(`📝 User ${userId} said: ${userMessage}`);

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

    // 🎯 ส่ง PDPA Consent ทุกครั้ง (ชั่วคราว)
    const flexMessage = createConsentFlex();
    await LineAPI.replyMessage(replyToken, flexMessage);
  }
}

module.exports = { MessageRouter };
