const LineManager = require('../core/line-manager');

class ConsentManager {
  constructor() {
    console.log('🎯 ConsentManager initialized');
    this.waitingForUserInfo = new Set();
    
    // ✅ ใช้ fallback manager ชั่วคราว
    this.sheetsManager = {
      getUserById: async (userId) => {
        console.log(`🔍 Fallback: Checking user ${userId}`);
        return null; // ให้ขอ consent ใหม่ทุกครั้ง
      },
      saveConsent: async (userId, status) => {
        console.log(`📝 Fallback: Saved consent for ${userId}: ${status}`);
        return true;
      },
      saveUserProfile: async (userId, profile) => {
        console.log(`📝 Fallback: Saved profile for ${userId}`, profile);
        return true;
      },
      checkUserConsent: async (userId) => false
    };
  }

  async handleUserMessage(userId, userMessage, replyToken) {
    try {
      console.log(`🔍 ConsentManager: User ${userId} -> ${userMessage}`);
      
      const hasConsented = await this.sheetsManager.checkUserConsent(userId);
      
      if (!hasConsented) {
        return await this.handleNewUser(userId, userMessage, replyToken);
      } else {
        if (this.waitingForUserInfo.has(userId)) {
          return await this.handleUserInfoInput(userId, userMessage, replyToken);
        }
        return 'consented_user'; // ✅ ส่งกลับ string แทน method call
      }
    } catch (error) {
      console.error('❌ ConsentManager error:', error);
      await LineManager.sendTextMessage(replyToken, 'ขออภัย ระบบตรวจสอบยินยอมมีปัญหา');
      return 'error';
    }
  }

  // methods อื่นๆตามเดิม...
}

module.exports = ConsentManager; // ✅ ตรวจสอบบรรทัดนี้
