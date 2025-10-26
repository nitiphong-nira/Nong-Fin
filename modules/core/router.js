const LineManager = require('./line-manager');
const ConsentManager = require('../auth/consent-manager');
const KeywordHandler = require('../features/keyword-handler');

class MessageRouter {
  constructor() {
    this.consentManager = new ConsentManager();
    this.botPaused = false;
    this.ADMIN_ID = process.env.ADMIN_LINE_ID;
  }

  async handleMessage(event) {
    console.log('🔍 [Router] handleMessage START');
    
    try {
      const { replyToken, message, source } = event;
      const userId = source.userId;
      const userMessage = message.text;

      console.log(`💬 User ${userId} said: ${userMessage}`);

      // ตรวจสอบคำสั่ง Admin
      console.log('🔍 [Router] Checking admin commands...');
      const adminResult = await this.handleAdminCommand(userId, userMessage, replyToken);
      if (adminResult.handled) return;

      // ตรวจสอบการหยุดชั่วคราว
      console.log('🔍 [Router] Checking bot pause...');
      if (this.botPaused && userId !== this.ADMIN_ID) {
        await LineManager.sendTextMessage(replyToken, '⏸️ บอทกำลังปิดปรับปรุง');
        return;
      }

      // ตรวจสอบ Consent
      console.log('🔍 [Router] Calling handleUserMessage...');
      await this.handleUserMessage(userId, userMessage, replyToken);
      
      console.log('🔍 [Router] handleMessage COMPLETE');

    } catch (error) {
      console.error('❌ Router error:', error);
      await LineManager.sendTextMessage(replyToken, 'ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  }

  async handleAdminCommand(userId, userMessage, replyToken) {
    if (userId !== this.ADMIN_ID) return { handled: false };

    if (userMessage === '!หยุด') {
      this.botPaused = true;
      await LineManager.sendTextMessage(replyToken, '🛑 บอทหยุดทำงานชั่วคราว');
      return { handled: true };
    }

    if (userMessage === '!เริ่ม') {
      this.botPaused = false;
      await LineManager.sendTextMessage(replyToken, '✅ บอทเริ่มทำงานปกติ');
      return { handled: true };
    }

    return { handled: false };
  }

  async handleUserMessage(userId, userMessage, replyToken) {
    // ตรวจสอบ Consent
    const consentResult = await this.consentManager.handleUserMessage(userId, userMessage, replyToken);
    
    // ถ้ายินยอมแล้วและไม่ใช่คำตอบ Consent -> ตรวจสอบ Keyword
    if (consentResult === 'consented_user') {
      await KeywordHandler.handleMessage(userMessage, replyToken);
    }
  }
}

module.exports = { MessageRouter };
