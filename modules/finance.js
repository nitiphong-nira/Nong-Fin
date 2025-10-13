const { replyMessage } = require('../utils/reply');

function handleFinance(userId, text, userStates) {
  if (!userStates[userId].step) {
    userStates[userId].step = 'menu';
    return replyMessage(
      userId,
      'วันนี้อยากให้น้องฟินช่วยเรื่องอะไรดีคะ?\n\n' +
      '1️⃣ คำนวณภาษี\n2️⃣ แผนการลงทุน\n3️⃣ แผนประกัน\n4️⃣ บันทึกรายรับรายจ่าย\n5️⃣ แผนเกษียณ'
    );
  }

  if (text.includes('ภาษี')) {
    userStates[userId].step = 'tax';
    return replyMessage(userId, 'เริ่มคำนวณภาษีเลยค่ะ คุณมีรายได้จากอะไรบ้าง?');
  }

  if (text.includes('ลงทุน')) {
    return replyMessage(userId, 'ขอทราบเป้าหมายการลงทุนของคุณหน่อยค่ะ 💰');
  }

  if (text.includes('ประกัน')) {
    return replyMessage(userId, 'สนใจวางแผนประกันชีวิตหรือสุขภาพคะ?');
  }

  if (text.includes('รายรับรายจ่าย')) {
    return replyMessage(userId, 'กรุณาส่งรูปหรือข้อความสรุปรายรับรายจ่ายประจำวันได้เลยค่ะ!');
  }

  if (text.includes('เกษียณ')) {
    return replyMessage(userId, 'อยากเกษียณอายุเท่าไรดีคะ 🏝️');
  }

  replyMessage(userId, 'น้องฟินยังไม่เข้าใจค่ะ พิมพ์ “เมนู” เพื่อเริ่มใหม่ได้เลย 💚');
}

module.exports = { handleFinance };
