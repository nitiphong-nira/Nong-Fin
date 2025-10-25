import { replyMessage } from './utils.js';

const userConsents = new Map();
const userProfiles = new Map(); // เก็บข้อมูลผู้ใช้
const userTaxData = new Map(); // เก็บข้อมูลภาษี

export async function handleConsent(event, userMsg, userId) {
  // ถ้ายังไม่ยินยอม
  if (!userConsents.get(userId)) {
    await handleConsentFlow(event, userMsg, userId);
    return;
  }

  // ถ้ายินยอมแล้ว -> ไปที่ฟังก์ชันภาษี
  await handleTaxFlow(event, userMsg, userId);
}

async function handleConsentFlow(event, userMsg, userId) {
  if (userMsg === 'ยินยอม') {
    userConsents.set(userId, true);
    await replyMessage(event.replyToken,
`✅ ขอบคุณที่ไว้วางใจ! 

เราจะช่วยคุณคำนวณและจัดการภาษี

พิมพ์ "คำนวณภาษี" เพื่อเริ่มต้น
หรือ "ช่วยเหลือ" เพื่อดูคำสั่งทั้งหมด`
    );
  } else {
    await replyMessage(event.replyToken,
`📋 *Nong-Fin Tax Bot*
ช่วยคุณคำนวณภาษีและให้คำแนะนำการเงิน

พิมพ์ "ยินยอม" เพื่อเริ่มใช้งาน`
    );
  }
}

async function handleTaxFlow(event, userMsg, userId) {
  const userState = userTaxData.get(userId)?.state || 'idle';

  switch (userMsg.toLowerCase()) {
    case 'คำนวณภาษี':
    case 'calc':
    case 'tax':
      await startTaxCalculation(event, userId);
      break;
    
    case 'ช่วยเหลือ':
    case 'help':
      await showHelp(event.replyToken);
      break;
    
    default:
      await handleTaxQuestions(event, userMsg, userId, userState);
  }
}

async function startTaxCalculation(event, userId) {
  userTaxData.set(userId, {
    state: 'asking_income_type',
    data: {}
  });

  await replyMessage(event.replyToken,
`💰 *เริ่มคำนวณภาษี*

รายได้หลักของคุณมาจากช่องทางใด?
1. เงินเดือน
2. ฟรีแลนซ์  
3. ธุรกิจส่วนตัว
4. อื่นๆ

พิมพ์ตัวเลขหรือชื่อประเภทรายได้`
  );
}

async function showHelp(replyToken) {
  await replyMessage(replyToken,
`📋 *คำสั่งทั้งหมด*

• คำนวณภาษี - เริ่มคำนวณภาษี
• ช่วยเหลือ - แสดงคำสั่งนี้
• ยกเลิก - ออกจากโหมดคำนวณ

เราจะช่วยคุณ:
✅ คำนวณภาษีที่ต้องชำระ
✅ ให้คำแนะนำการลดหย่อน
✅ เตรียมความพร้อมยื่นภาษี`
  );
}

async function handleTaxQuestions(event, userMsg, userId, userState) {
  // Logic สำหรับถามคำถามภาษีตาม state
  // (จะ implement เต็มใน phase 2)
  await replyMessage(event.replyToken,
`🔧 ระบบคำนวณภาษีกำลังพัฒนาเร็วๆ นี้!

ขณะนี้สามารถให้คำแนะนำเบื้องต้นได้

พิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่ง`
  );
}
