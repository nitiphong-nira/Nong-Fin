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
  console.log('🔍 [DEBUG] Testing message send...');
  
  // ทดสอบส่งข้อความง่ายๆ แบบ manual
  try {
    const axios = require('axios');
    const response = await axios.post(
      'https://api.line.me/v2/bot/message/reply',
      {
        replyToken: replyToken,
        messages: [{ 
          type: 'text', 
          text: 'ทดสอบข้อความจาก manual axios' 
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Manual send success:', response.status);
  } catch (error) {
    console.error('❌ Manual send failed:', error.response?.data);
  }
  
  return 'sent_consent';
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
