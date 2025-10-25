import { replyMessage } from './utils.js';
import { getSheetsClient } from './sheets.js';

// Memory fallback
const memoryConsents = new Map();

// ฟังก์ชันบันทึก Consent ลง Sheets
async function saveConsentToSheet(userId, userData) {
  try {
    const sheets = await getSheetsClient();
    if (!sheets) {
      throw new Error('Sheets not available');
    }
    
    const { firstName = '', lastName = '', email = '', consent } = userData;
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:F', // บันทึกจากคอลัมน์ A ถึง F
      valueInputOption: 'RAW',
      resource: {
        values: [[
          new Date().toISOString(), // Timestamp (A)
          firstName,                // ชื่อ (B)
          lastName,                 // นามสกุล (C)
          userId,                   // Line ID (D) - ได้อัตโนมัติ
          email,                    // อีเมล (E)
          consent                   // การยินยอม (F) - User เลือกเอง
        ]]
      }
    });
    
    console.log(`✅ Consent saved to Sheets: ${userId}`);
    return true;
  } catch (error) {
    console.warn('⚠️ Cannot save to Sheets, using memory:', error.message);
    // Fallback to memory
    if (userData.consent === 'ยินยอม') {
      memoryConsents.set(userId, true);
    }
    return false;
  }
}

// ตรวจสอบ Consent จาก Sheets
async function getUserConsentFromSheet(userId) {
  try {
    const sheets = await getSheetsClient();
    if (!sheets) {
      throw new Error('Sheets not available');
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:F', // อ่านข้อมูลทั้งหมด
    });
    
    const rows = response.data.values || [];
    
    // หาว่า user นี้เคยยินยอมแล้วหรือไม่ (column D = Line ID, F = consent)
    const userConsented = rows.find(row => row[3] === userId && row[5] === 'ยินยอม');
    
    return userConsented ? { consented: true } : null;
  } catch (error) {
    console.warn('⚠️ Cannot read from Sheets, using memory:', error.message);
    // Fallback to memory
    return memoryConsents.get(userId) ? { consented: true } : null;
  }
}

export async function hasUserConsented(userId) {
  const consentData = await getUserConsentFromSheet(userId);
  return consentData ? consentData.consented : false;
}

export async function handleConsentFlow(event, userMsg, userId) {
  const hasConsented = await hasUserConsented(userId);
  
  // ถ้ายินยอมแล้ว -> ใช้งานฟีเจอร์ได้เลย
  if (hasConsented) {
    console.log(`✅ User ${userId} already consented`);
    const { handleFinanceCommand } = await import('./finance.js');
    await handleFinanceCommand(event, userMsg, userId);
    return;
  }

  // ตรวจสอบสถานะของผู้ใช้
  const userState = memoryConsents.get(userId);

  // ถ้ากำลังรอข้อมูลผู้ใช้
  if (userState === 'collecting_info') {
    await processUserInfo(event, userMsg, userId);
    return;
  }

  // ยังไม่ยินยอม -> ตรวจสอบคำตอบ
  if (userMsg === 'ยินยอม') {
    memoryConsents.set(userId, 'collecting_info');
    await replyMessage(event.replyToken,
`✅ ขอบคุณที่ยินยอม!

📝 กรุณากรอกข้อมูลส่วนตัว
ชื่อ นามสกุล อีเมล

เช่น: 
สมชาย ใจดี somchai@email.com`
    );
  } 
  else if (userMsg === 'ไม่ยินยอม') {
    // บันทึกว่าปฏิเสธ
    await saveConsentToSheet(userId, { consent: 'ไม่ยินยอม' });
    await replyMessage(event.replyToken, 
      `❌ ขออภัย คุณต้องยินยอมก่อนจึงจะใช้งาน Nong-Fin ได้
หากเปลี่ยนใจ สามารถพิมพ์ "ยินยอม" ได้ตลอดเวลา`
    );
  }
  else {
    await sendConsentForm(event.replyToken, userId);
  }
}

// ประมวลผลข้อมูลผู้ใช้
async function processUserInfo(event, userMsg, userId) {
  const parts = userMsg.split(' ');
  
  if (parts.length >= 3) {
    const firstName = parts[0];
    const lastName = parts[1];
    const email = parts[2];

    // บันทึกลง Sheets
    const saved = await saveConsentToSheet(userId, {
      firstName: firstName,
      lastName: lastName,
      email: email,
      consent: 'ยินยอม'
    });

    if (saved) {
      memoryConsents.set(userId, true);
      await replyMessage(event.replyToken,
        `✅ บันทึกข้อมูลเรียบร้อย! 
ขอบคุณ ${firstName}

ระบบจะจำการยินยอมของคุณไว้
คุณสามารถเริ่มใช้งาน Nong-Fin ได้แล้ว 😊`
      );
    } else {
      // Fallback to memory
      memoryConsents.set(userId, true);
      await replyMessage(event.replyToken,
        `✅ ขอบคุณ ${firstName}
ระบบบันทึกข้อมูลชั่วคราว
สามารถใช้งานได้แล้ว 👍`
      );
    }
  } else {
    await replyMessage(event.replyToken,
      `❌ รูปแบบไม่ถูกต้อง
กรุณาพิมพ์: ชื่อ นามสกุล อีเมล

เช่น: สมชาย ใจดี somchai@email.com`
    );
  }
}

export async function sendConsentForm(replyToken, userId) {
  const consentMessage = 
`📋 *ข้อตกลงและเงื่อนไขการใช้งาน Nong-Fin*

ก่อนเริ่มใช้งาน ต้องการ您的ความยินยอมในการเก็บและประมวลผลข้อมูล

✅ บันทึกและประมวลผลข้อมูลการเงิน
✅ เก็บข้อมูลเพื่อการวิเคราะห์และพัฒนาบริการ  
✅ นำข้อมูลไปใช้ในการให้คำแนะนำทางการเงิน

*ข้อมูลของคุณจะถูกเก็บเป็นความลับ*

พิมพ์ "ยินยอม" หรือ "ไม่ยินยอม"`;

  await replyMessage(replyToken, consentMessage);
}
