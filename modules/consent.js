import { replyMessage, replyFlexMessage } from './utils.js';
import { 
  consentFlexMessage,
  userInfoFlexMessage,
  exampleFlexMessage 
} from './flex-messages.js';
import { checkUserConsent, saveConsentToSheets, saveUserInfoToSheets } from './sheets.js';

const userProfiles = new Map();
const userStates = new Map();

export async function handleConsent(event, userMsg, userId) {
  // Step 0: ตรวจสอบ Line ID ใน Sheets ก่อน
  const hasConsented = await checkUserConsent(userId);
  
  if (hasConsented) {
    // Step 3: เคยยินยอมแล้ว -> ไป Rich Menu
    await handleMainMenu(event, userMsg, userId);
  } else {
    // Step 1: ยังไม่เคยยินยอม
    await handleConsentFlow(event, userMsg, userId);
  }
}

async function handleConsentFlow(event, userMsg, userId) {
  // จำกัดคำตอบให้เป็น 2 ทางเท่านั้น
  switch (userMsg) {
    case 'ยินยอม':
      // บันทึก Consent ลง Sheets
      await saveConsentToSheets(userId, 'ยินยอม');
      
      // ส่งไปขอข้อมูลส่วนตัว
      await replyFlexMessage(event.replyToken, userInfoFlexMessage(userId));
      userStates.set(userId, 'collecting_info');
      break;

    case 'ไม่ยินยอม':
      // บันทึก Consent ลง Sheets
      await saveConsentToSheets(userId, 'ไม่ยินยอม');
      
      await replyMessage(event.replyToken,
        `❌ ขออภัย คุณต้องยินยอมก่อนจึงจะใช้งานได้
        
หากเปลี่ยนใจ สามารถพิมพ์ "ยินยอม" ได้ตลอดเวลา`
      );
      break;

    default:
      // ถ้าพิมพ์อะไรที่ไม่ใช่ "ยินยอม"/"ไม่ยินยอม" -> ส่ง Consent ใหม่
      await replyFlexMessage(event.replyToken, consentFlexMessage);
  }
}

async function handleUserInfoFlow(event, userMsg, userId) {
  switch (userMsg) {
    case 'ตัวอย่างการกรอก':
      await replyFlexMessage(event.replyToken, exampleFlexMessage);
      break;

    case 'กรอกข้อมูล':
      await replyMessage(event.replyToken,
        `📝 พิมพ์ข้อมูลในรูปแบบ:
ชื่อ นามสกุล อีเมล

เช่น: สมชาย ใจดี somchai@gmail.com`
      );
      break;

    case 'ข้ามการกรอก':
      // บันทึกว่าข้ามการกรอก
      await saveUserInfoToSheets(userId, { skipped: true });
      userStates.delete(userId);
      
      await replyMessage(event.replyToken,
        `✅ ข้ามการกรอกข้อมูลแล้ว

คุณสามารถใช้งานเมนูด้านล่างได้เลย! 🚀`
      );
      break;

    default:
      // พยายามประมวลผลเป็นข้อมูลผู้ใช้
      await processUserInfo(event, userMsg, userId);
  }
}

async function processUserInfo(event, userMsg, userId) {
  const parts = userMsg.split(' ');
  
  if (parts.length >= 3) {
    const firstName = parts[0];
    const lastName = parts[1];
    const email = parts[2];

    if (!email.includes('@')) {
      await replyMessage(event.replyToken,
        `❌ อีเมลไม่ถูกต้อง
        
กรุณากรอกอีเมลให้ถูกต้อง格式`
      );
      return;
    }

    // บันทึกข้อมูลส่วนตัวลง Sheets
    const userData = {
      firstName,
      lastName,
      email,
      timestamp: new Date().toISOString()
    };

    await saveUserInfoToSheets(userId, userData);
    userProfiles.set(userId, userData);
    userStates.delete(userId);

    await replyMessage(event.replyToken,
      `✅ บันทึกข้อมูลเรียบร้อย!
ขอบคุณ ${firstName}

ตอนนี้คุณสามารถใช้งานเมนูด้านล่างได้เต็มที่แล้ว 🚀`
    );

  } else {
    // ถ้ารูปแบบไม่ถูกต้อง
    await replyMessage(event.replyToken,
      `❌ รูปแบบไม่ถูกต้อง

กรุณากรอก: ชื่อ นามสกุล อีเมล

หรือใช้ปุ่ม "ข้ามการกรอก" หากต้องการใช้งานทันที`
    );
  }
}

async function handleMainMenu(event, userMsg, userId) {
  // ฟังก์ชัน Rich Menu หลัก
  // (จะ implement เต็มใน Phase ต่อไป)
  await replyMessage(event.replyToken,
    `🎉 ยินดีต้อนรับกลับ!

คุณสามารถใช้งานเมนูด้านล่างได้เลย
    
เร็วๆ นี้จะมีฟังก์ชันเหล่านี้:
• 📊 คำนวณภาษี
• 📈 การลงทุนลดหย่อน  
• 🛡️ ประกันชีวิต
• 🎯 แผนเกษียณ
• 💵 บันทึกรายรับรายจ่าย`
  );
}
