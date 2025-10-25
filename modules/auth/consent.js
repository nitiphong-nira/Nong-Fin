class ConsentManager {
  async checkConsent(userId) {
    // ตรวจสอบใน Google Sheets ว่า user ยินยอมแล้วไหม
    // return true ถ้ายินยอม, false ถ้ายัง
  }

  async requestConsent(replyToken) {
    // ส่งปุ่ม "ยินยอม/ไม่ยินยอม" ไปให้ user
  }

  async saveConsent(userId, answer) {
    // เก็บคำตอบใน Google Sheets
  }
}
