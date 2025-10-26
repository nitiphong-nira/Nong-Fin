const LineManager = require('../core/line-manager');

class KeywordHandler {
  static checkKeyword(text) {
    const keywords = {
      'คำนวณภาษี': '📊 เปิดระบบคำนวณภาษีให้แล้ว! กรุณากดปุ่ม "คำนวณภาษี" ด้านล่าง',
      'ลงทุน': '📈 เปิดระบบการลงทุนให้แล้ว! กรุณากดปุ่ม "แผนการลงทุน" ด้านล่าง',
      'ประกัน': '🛡️ เปิดระบบประกันให้แล้ว! กรุณากดปุ่ม "แผนประกัน" ด้านล่าง',
      'เกษียณ': '👵 เปิดระบบเกษียณให้แล้ว! กรุณากดปุ่ม "แผนเกษียณ" ด้านล่าง',
      'รายรับรายจ่าย': '💰 เปิดระบบบันทึกให้แล้ว! กรุณากดปุ่ม "บันทึกรายรับรายจ่าย" ด้านล่าง',
      'ช่วยเหลือ': '📞 ติดต่อ Admin: @admin หรือส่งคำถามมาได้เลย'
    };
    
    const lowerText = text.toLowerCase();
    for (const [keyword, response] of Object.entries(keywords)) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return response;
      }
    }
    return null;
  }

  static async handleMessage(userMessage, replyToken) {
    const keywordResponse = this.checkKeyword(userMessage);
    if (keywordResponse) {
      await LineManager.sendTextMessage(replyToken, keywordResponse);
      return true;
    } else {
      await LineManager.sendTextMessage(replyToken, 'กรุณาเลือกเมนูที่ต้องการจาก Rich Menu ด้านล่าง 😊');
      return false;
    }
  }
}

module.exports = KeywordHandler;
