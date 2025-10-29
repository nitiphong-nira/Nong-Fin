const LineManager = require('../core/line-manager');
const SheetsManager = require('./sheets');

class ConsentManager {
  constructor() {
    this.sheetsManager = new SheetsManager();
    this.waitingForUserInfo = new Set();
    this.sheetsReady = false;
    this.initializeSheets();
  }

  async initializeSheets() {
    try {
      this.sheetsReady = await this.sheetsManager.ensureInitialized();
      if (!this.sheetsReady) {
        console.log('⚠️  Google Sheets not available - using fallback mode');
      }
    } catch (error) {
      console.error('❌ Failed to initialize sheets:', error);
    }
  }

  async handleUserMessage(userId, userMessage, replyToken) {
    console.log(`🔍 ตรวจสอบ user ${userId}: ${userMessage}`);
    
    let hasConsented = false;
    
    // ✅ ตรวจสอบว่า sheets พร้อมใช้งาน
    if (this.sheetsReady) {
      const userData = await this.sheetsManager.getUserById(userId);
      hasConsented = userData && userData.consent === 'ยินยอม';
    } else {
      // ✅ Fallback: ใช้ memory-based consent ชั่วคราว
      console.log('⚠️  Using memory-based consent (sheets not available)');
      hasConsented = this.checkMemoryConsent(userId);
    }
    
    if (!hasConsented) {
      return await this.handleNewUser(userId, userMessage, replyToken);
    } else {
      if (this.waitingForUserInfo.has(userId)) {
        return await this.handleUserInfoInput(userId, userMessage, replyToken);
      }
      return await this.handleExistingUser(userId, userMessage, replyToken);
    }
  }

  // ✅ Fallback method ชั่วคราว
  checkMemoryConsent(userId) {
    // ใช้ memory-based consent จนกว่า sheets จะพร้อม
    return false; // ให้ขอ consent ใหม่ทุกครั้ง
  }

  // methods อื่นๆ...
}
