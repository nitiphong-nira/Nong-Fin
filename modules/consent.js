import { replyMessage, saveToSheets } from './utils.js';

// เก็บใน memory (ง่ายที่สุด)
const userConsents = new Map();

// ข้อความสำเร็จรูป
const messages = {
  askConsent: `📋 ยินยอมให้เก็บข้อมูลตามนโยบายความเป็นส่วนตัวหรือไม่?

พิมพ์ "ยินยอม" หรือ "ไม่ยินยอม"`,

  askInfo: `✅ ขอบคุณ! กรุณากรอก
ชื่อ นามสกุล อีเมล

เช่น: สมชาย ใจดี somchai@email.com`,

  welcome: (name) => `✅ ขอบคุณ ${name}! เริ่มใช้งานได้เลย 😊`
};

export async function handleConsent(event, userMsg, userId) {
  // เช็คว่ายินยอมแล้วหรือยัง
  if (userConsents.get(userId)) {
    await handleFinance(event, userMsg, userId);
    return;
  }

  // กำลังกรอกข้อมูล
  if (userConsents.get(userId) === 'collecting') {
    await processUserInfo(event, userMsg, userId);
    return;
  }

  // ตรวจสอบคำตอบ consent
  if (userMsg === 'ยินยอม') {
    userConsents.set(userId, 'collecting');
    await replyMessage(event.replyToken, messages.askInfo);
  } 
  else if (userMsg === 'ไม่ยินยอม') {
    await replyMessage(event.replyToken, '❌ ต้องยินยอมก่อนถึงใช้งานได้');
  }
  else {
    await replyMessage(event.replyToken, messages.askConsent);
  }
}

async function processUserInfo(event, userMsg, userId) {
  const parts = userMsg.split(' ');
  
  if (parts.length >= 3) {
    const [firstName, lastName, email] = parts;
    
    // บันทึกข้อมูล
    await saveToSheets({
      userId,
      firstName,
      lastName, 
      email,
      consent: 'ยินยอม'
    });

    userConsents.set(userId, true);
    await replyMessage(event.replyToken, messages.welcome(firstName));
  } else {
    await replyMessage(event.replyToken, '❌ กรุณากรอก ชื่อ นามสกุล อีเมล ให้ครบ');
  }
}

async function handleFinance(event, userMsg, userId) {
  // ฟังก์ชันการเงินพื้นฐาน
  let reply = 'ได้รับข้อความของคุณแล้ว 😊';
  
  if (userMsg.includes('ช่วยเหลือ')) {
    reply = 'พิมพ์ "รายรับ", "รายจ่าย" เพื่อบันทึก';
  }
  
  await replyMessage(event.replyToken, reply);
}
