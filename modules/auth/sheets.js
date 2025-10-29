const { GoogleSpreadsheet } = require('google-spreadsheet');

class SheetsManager {
  constructor() {
    this.doc = null;
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
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
    } catch (error) {
      console.error('❌ Google Sheets connection failed:', error);
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
    return this.initialized;
  }

  async getUserById(userId) {
    if (!(await this.ensureInitialized())) return null;
    
    try {
      const sheet = this.doc.sheetsByTitle['user_consents'];
      const rows = await sheet.getRows();
      
      const userRow = rows.find(row => row['Line ID'] === userId);
      
      if (userRow) {
        return {
          timestamp: userRow['Timestamp'],
          firstName: userRow['ชื่อ'],
          lastName: userRow['นามสกุล'],
          lineId: userRow['Line ID'],
          email: userRow['อีเมล'],
          consent: userRow['การยินยอม']
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async saveConsent(userId, consentStatus) {
    if (!(await this.ensureInitialized())) return false;
    
    try {
      const sheet = this.doc.sheetsByTitle['user_consents'];
      const timestamp = new Date().toISOString();
      
      await sheet.addRow({
        'Timestamp': timestamp,
        'Line ID': userId,
        'การยินยอม': consentStatus,
        'ชื่อ': '',
        'นามสกุล': '', 
        'อีเมล': ''
      });
      
      console.log(`✅ Saved consent for user ${userId}: ${consentStatus}`);
      return true;
    } catch (error) {
      console.error('Error saving consent:', error);
      return false;
    }
  }

  async saveUserProfile(userId, profile) {
    if (!(await this.ensureInitialized())) return false;
    
    try {
      const sheet = this.doc.sheetsByTitle['user_consents'];
      const rows = await sheet.getRows();
      
      const userRow = rows.find(row => row['Line ID'] === userId);
      
      if (userRow) {
        userRow['ชื่อ'] = profile.firstName || '';
        userRow['นามสกุล'] = profile.lastName || '';
        userRow['อีเมล'] = profile.email || '';
        await userRow.save();
        
        console.log(`✅ Updated profile for user ${userId}`);
        return true;
      }
      
      console.log(`❌ User ${userId} not found for profile update`);
      return false;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  }

  async checkUserConsent(userId) {
    const user = await this.getUserById(userId);
    return user && user.consent === 'ยินยอม';
  }
}

module.exports = SheetsManager;
