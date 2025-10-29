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
    await LineManager.sendConsentFlexMessage(replyToken);
    return 'sent_consent';
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
