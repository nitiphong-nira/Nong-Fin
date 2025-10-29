const { GoogleSpreadsheet } = require('google-spreadsheet');

class SheetsManager {
  constructor() {
    this.doc = null;
    this.initialized = false;
    // ❌ อย่าเรียก init() ใน constructor - อาจ fail ก่อน environment ready
    // this.init(); // ลบบรรทัดนี้
  }

  async init() {
    try {
      // ✅ ตรวจสอบ environment variables ก่อน
      if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log('⚠️  Google Sheets environment variables not set');
        return false;
      }

      const sheetId = process.env.GOOGLE_SHEET_ID;
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      
      this.doc = new GoogleSpreadsheet(sheetId);
      
      await this.doc.useServiceAccountAuth({
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      });
      
      await this.doc.loadInfo();
      this.initialized = true;
      console.log('✅ Google Sheets connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Google Sheets connection failed:', error.message);
      return false;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      return await this.init();
    }
    return this.initialized;
  }

  // methods อื่นๆ...
}
