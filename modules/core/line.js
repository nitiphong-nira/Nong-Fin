const line = require('@line/bot-sdk');
const config = require('../../config/line-config');

const client = new line.Client(config);

class LineHandler {
  static async handleEvent(event) {
    if (event.type === 'message') {
      return await this.handleMessage(event);
    }
  }

  static async handleMessage(event) {
    console.log('ได้รับข้อความ:', event.message.text);
    // ส่งต่อให้ router จัดการ
  }
}

module.exports = LineHandler;
