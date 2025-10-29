const axios = require('axios');

class LineManager {
  static async sendMessage(replyToken, message) {
    try {
      const response = await axios.post(
        'https://api.line.me/v2/bot/message/reply',
        {
          replyToken: replyToken,
          messages: Array.isArray(message) ? message : [message]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ ส่งข้อความสำเร็จ');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ ส่งข้อความไม่สำเร็จ:', error.response?.data);
      return { success: false, error: error.message };
    }
  }

  static async sendTextMessage(replyToken, text) {
    return await this.sendMessage(replyToken, {
      type: 'text',
      text: text
    });
  }

  static async sendFlexMessage(replyToken, flexContent) {
    return await this.sendMessage(replyToken, {
      type: 'flex',
      altText: 'Flex Message',
      contents: flexContent
    });
  }

  static async getUserProfile(userId) {
    try {
      const response = await axios.get(
        `https://api.line.me/v2/bot/profile/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
          }
        }
      );
      return { success: true, profile: response.data };
    } catch (error) {
      console.error('รับข้อมูลผู้ใช้ไม่สำเร็จ:', error.response?.data);
      return { success: false, profile: null };
    }
  }

  /**
   * ส่งข้อความไปยังผู้ใช้โดยตรง (ไม่ใช้ replyToken)
   */
  static async sendTextMessageToUser(userId, text) {
    try {
      const response = await axios.post(
        'https://api.line.me/v2/bot/message/push',
        {
          to: userId,
          messages: [{
            type: 'text',
            text: text
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ ส่งข้อความถึงผู้ใช้สำเร็จ');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ ส่งข้อความถึงผู้ใช้ไม่สำเร็จ:', error.response?.data);
      return { success: false, error: error.message };
    }
  }

  /**
   * ผูก Rich Menu กับผู้ใช้
   */
  static async linkRichMenuToUser(userId, richMenuId = null) {
    try {
      // ถ้าไม่ได้ระบุ richMenuId ให้ใช้ default
      const targetRichMenuId = richMenuId || process.env.DEFAULT_RICH_MENU_ID;
      
      if (!targetRichMenuId) {
        console.log('⚠️  ไม่มี Rich Menu ID ที่กำหนด');
        // ✅ ส่งข้อความแทนถ้าไม่มี Rich Menu
        await this.sendTextMessageToUser(userId, '🎉 ยินดีต้อนรับสู่ Nong Fin! กรุณาเลือกเมนูด้านล่าง');
        return { success: false, error: 'No Rich Menu ID specified' };
      }

      const response = await axios.post(
        `https://api.line.me/v2/bot/user/${userId}/richmenu/${targetRichMenuId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ ผูก Rich Menu สำเร็จสำหรับผู้ใช้ ${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ ผูก Rich Menu ไม่สำเร็จ:', error.response?.data);
      // ✅ ส่งข้อความแทนถ้าเชื่อมต่อ Rich Menu ไม่ได้
      await this.sendTextMessageToUser(userId, '🎉 ยินดีต้อนรับสู่ Nong Fin!');
      return { success: false, error: error.message };
    }
  }

  /**
   * สร้างและส่ง Confirm Template (Rich Message)
   */
  static async sendConfirmTemplate(replyToken, altText, text, actions) {
    return await this.sendMessage(replyToken, {
      type: 'template',
      altText: altText,
      template: {
        type: 'confirm',
        text: text,
        actions: actions
      }
    });
  }

  /**
   * ส่ง Consent Message แบบ Confirm Template
   */
  static async sendConsentMessage(replyToken) {
    return await this.sendConfirmTemplate(
      replyToken,
      'คำขอความยินยอม',
      'กรุณายินยอมให้เก็บข้อมูลส่วนตัวเพื่อใช้บริการ Nong Fin',
      [
        {
          type: 'message',
          label: '✅ ยินยอม',
          text: 'ยินยอม'
        },
        {
          type: 'message',
          label: '❌ ไม่ยินยอม',
          text: 'ไม่ยินยอม'
        }
      ]
    );
  }

  /**
   * ✅ เพิ่ม method ใหม่: ส่ง Consent Flex Message
   */
  static async sendConsentFlexMessage(replyToken) {
    try {
      const { createConsentFlex } = require('../messages/flex-consent');
      const flexContent = createConsentFlex();
      return await this.sendFlexMessage(replyToken, flexContent.contents);
    } catch (error) {
      console.error('❌ ส่ง Consent Flex Message ไม่สำเร็จ:', error);
      // ✅ Fallback ไปใช้ Confirm Template ถ้า Flex ไม่ทำงาน
      return await this.sendConsentMessage(replyToken);
    }
  }
}

module.exports = LineManager;
