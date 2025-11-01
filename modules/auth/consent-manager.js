const LineManager = require('../core/line-manager');

class ConsentManager {
  constructor() {
    console.log('🎯 ConsentManager initialized');
    this.waitingForUserInfo = new Set();
    
    this.sheetsManager = {
      getUserById: async (userId) => {
        console.log(`🔍 Fallback: Checking user ${userId}`);
        return null;
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
        return 'consented_user';
      }
    } catch (error) {
      console.error('❌ ConsentManager error:', error);
      await LineManager.sendTextMessage(replyToken, 'ขออภัย ระบบตรวจสอบยินยอมมีปัญหา');
      return 'error';
    }
  }

  async handleNewUser(userId, userMessage, replyToken) {
  console.log(`🆕 Handling new user: ${userId}, message: ${userMessage}`);
  
  if (userMessage === 'ยินยอม') {
    await this.sheetsManager.saveConsent(userId, 'ยินยอม');
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
    try {
      await LineManager.sendConsentFlexMessage(replyToken);
      return 'sent_consent';
    } catch (error) {
      console.error('❌ Failed to send flex message:', error);
      // Fallback to text message
      await LineManager.sendTextMessage(replyToken,
        '📜 **กรุณายินยอมให้เก็บข้อมูลส่วนตัว**\n\n' +
        'คุณยินยอมให้น้องฟินเก็บข้อมูลเพื่อให้บริการหรือไม่?\n\n' +
        'พิมพ์ "ยินยอม" หรือ "ไม่ยินยอม"'
      );
      return 'sent_consent_fallback';
    }
  }
}

  async handleUserInfoInput(userId, userMessage, replyToken) {
    console.log(`📝 User info input: ${userMessage}`);
    const userProfile = this.parseUserInfo(userMessage);
    if (userProfile) {
      await this.sheetsManager.saveUserProfile(userId, userProfile);
      this.waitingForUserInfo.delete(userId);
      await LineManager.sendTextMessage(replyToken, `✅ บันทึกข้อมูลเรียบร้อย!\nชื่อ: ${userProfile.firstName} ${userProfile.lastName}\nอีเมล: ${userProfile.email}`);
      return 'info_saved';
    } else {
      await LineManager.sendTextMessage(replyToken, '❌ กรุณากรอกข้อมูลให้ครบถ้วน\nรูปแบบ: ชื่อ นามสกุล อีเมล\nตัวอย่าง: สมชาย ใจดี somchai@email.com');
      return 'invalid_info_format';
    }
  }

  parseUserInfo(text) {
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 3) {
      return { firstName: parts[0], lastName: parts[1], email: parts[2] };
    }
    return null;
  }

  async requestPersonalInfo(replyToken) {
    await LineManager.sendTextMessage(replyToken, '📝 กรุณากรอกข้อมูลส่วนตัว\nรูปแบบ: ชื่อ นามสกุล อีเมล\nตัวอย่าง: สมชาย ใจดี somchai@email.com');
  }
}

module.exports = ConsentManager;
