const { replyMessage } = require('../utils/reply');

function handleConsent(userId, text, userStates) {
  if (!userStates[userId]) {
    userStates[userId] = { consent: false };
    return replyMessage(userId,
      'คุณยินยอมให้น้องฟินเก็บข้อมูลส่วนตัวเพื่อให้บริการหรือไม่?\n\n1️⃣ ยินยอม\n2️⃣ ไม่ยินยอม');
  }

  if (text.includes('ยินยอม')) {
    userStates[userId].consent = true;
    return replyMessage(userId, 'ขอบคุณที่ยินยอม ❤️ น้องฟินพร้อมช่วยคุณแล้วค่ะ!');
  } else if (text.includes('ไม่ยินยอม')) {
    return replyMessage(userId, 'น้องฟินจะไม่เก็บข้อมูลของคุณ ขอบคุณที่แวะมานะคะ 🙏');
  } else {
    return replyMessage(userId, 'กรุณาพิมพ์ “ยินยอม” หรือ “ไม่ยินยอม” เท่านั้นค่ะ');
  }
}

module.exports = { handleConsent };
