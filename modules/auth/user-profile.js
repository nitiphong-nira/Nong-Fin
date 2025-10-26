const LineManager = require('../core/line-manager');

class UserProfile {
  constructor() {
    this.userProfiles = new Map(); // ชั่วคราวแทน Google Sheets
  }

  async getUserProfile(userId) {
    try {
      // ตรวจสอบว่ามีใน cache หรือไม่
      if (this.userProfiles.has(userId)) {
        return this.userProfiles.get(userId);
      }

      // ขอข้อมูลจาก Line API
      const result = await LineManager.getUserProfile(userId);
      
      if (result.success) {
        const profile = {
          userId: userId,
          displayName: result.profile.displayName,
          pictureUrl: result.profile.pictureUrl,
          statusMessage: result.profile.statusMessage,
          lastUpdated: new Date()
        };
        
        // เก็บใน cache
        this.userProfiles.set(userId, profile);
        console.log(`✅ รับข้อมูลโปรไฟล์ของ ${profile.displayName}`);
        return profile;
      } else {
        console.log(`❌ ไม่สามารถรับข้อมูลโปรไฟล์ของ ${userId}`);
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async saveUserProfile(userId, additionalData = {}) {
    try {
      // ขอข้อมูลโปรไฟล์จาก Line
      const profile = await this.getUserProfile(userId);
      
      if (profile) {
        // รวมข้อมูลเพิ่มเติม (ถ้ามี)
        const userData = {
          ...profile,
          ...additionalData,
          savedAt: new Date()
        };
        
        console.log(`💾 บันทึกข้อมูลผู้ใช้: ${userData.displayName}`);
        
        // TODO: เก็บใน Google Sheets (เมื่อพร้อม)
        // await this.saveToSheets(userData);
        
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return null;
    }
  }

  // รับชื่อผู้ใช้ (ถ้ามี)
  async getUserDisplayName(userId) {
    const profile = await this.getUserProfile(userId);
    return profile ? profile.displayName : 'ผู้ใช้';
  }

  // ตรวจสอบว่ามีข้อมูลผู้ใช้หรือไม่
  hasUserProfile(userId) {
    return this.userProfiles.has(userId);
  }

  // ล้าง cache (optional)
  clearCache() {
    this.userProfiles.clear();
    console.log('🧹 ล้าง cache ผู้ใช้แล้ว');
  }
}

module.exports = UserProfile;
