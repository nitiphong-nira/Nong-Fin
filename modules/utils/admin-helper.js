const LineAPI = require('./line-api');

class AdminHelper {
  static async notifyAdmin(message) {
    const adminId = process.env.ADMIN_LINE_ID;
    if (adminId) {
      await LineAPI.replyMessage(adminId, { type: 'text', text: message });
    }
  }
}

module.exports = AdminHelper;
