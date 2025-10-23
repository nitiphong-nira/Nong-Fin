import { replyMessage } from './utils.js';
import { getSheetsClient } from './sheets.js';

// Google Sheets configuration
const SHEET_NAME = 'Finway_PDPA_Consent';
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// ฟังก์ชันบันทึก Consent ลง Google Sheets
async function saveConsentToSheet(userId, consentResult) {
  try {
    const sheets = await getSheetsClient();
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [[
          new Date().toISOString(), // Timestamp
          '',                       // name (ว่างไว้กรอกทีหลัง)
          '',                       // surname (ว่างไว้กรอกทีหลัง)
          userId,                   // line ID (สำคัญที่สุด)
          '',                       // Phone number (ว่างไว้กรอกทีหลัง)
          consentResult             // consent result
        ]]
      }
    });
    
    console.log(`✅ Consent saved for LINE ID: ${userId}`);
  } catch (error) {
    console.error('❌ Error saving consent to sheet:', error.message);
  }
}

// ฟังก์ชันตรวจสอบ Consent จาก Google Sheets (ตรวจจาก Line ID)
async function getUserConsentFromSheet(userId) {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
    });
    
    const rows = response.data.values || [];
    
    // 🔍 หาจาก Line ID (column D) ว่ามี record ไหนที่ accepted บ้าง
    const userAcceptedRecords = rows.filter(row => 
      row[3] === userId && row[5] === 'accepted' // column D = Line ID, column F = consent result
    );
    
    if (userAcceptedRecords.length > 0) {
      const latestRecord = userAcceptedRecords[userAcceptedRecords.length - 1];
      return {
        consented: true,
        consentedAt: new Date(latestRecord[0]), // column A = timestamp
        lineId: latestRecord[3]                 // column D = Line ID
      };
    }
    
    return null; // ไม่พบ record ที่ accepted
  } catch (error) {
    console.error('❌ Error reading consent from sheet:', error.message);
    return null;
  }
}

// ฟังก์ชันส่ง Consent Form
export async function sendConsentForm(replyToken, userId) {
  const consentMessage = 
`📋 *ข้อตกลงและเงื่อนไขการใช้งาน Nong-Fin*

ก่อนเริ่มใช้งาน บอท Nong-Fin ต้องการ您的ความยินยอมในการ:

✅ บันทึกและประมวลผลข้อมูลการเงิน
✅ เก็บข้อมูลเพื่อการวิเคราะห์และพัฒนาบริการ
✅ นำข้อมูลไปใช้ในการให้คำแนะนำทางการเงิน

*ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เพื่อการพัฒนาบริการเท่านั้น*

หากยินยอม กรุณาพิมพ์ "ยอมรับ"
หากไม่ยอมรับ พิมพ์ "ไม่ยอมรับ"`;

  await replyMessage(replyToken, consentMessage);
}

// ตรวจสอบว่ายินยอมแล้วหรือไม่ (จาก Line ID)
export async function hasUserConsented(userId) {
  try {
    const consentData = await getUserConsentFromSheet(userId);
    return consentData ? consentData.consented : false;
  } catch (error) {
    console.error('❌ Error checking user consent:', error.message);
    return false;
  }
}

// จัดการ Consent Flow
export async function handleConsentFlow(event, userMsg, userId) {
  // ✅ ตรวจสอบจาก Line ID ว่ายินยอมแล้วหรือยัง
  const hasConsented = await hasUserConsented(userId);
  
  if (hasConsented) {
    console.log(`✅ User ${userId} already consented - proceeding to finance`);
    // ถ้ายินยอมแล้ว -> ส่งไป finance
    const { handleFinanceCommand } = await import('./finance.js');
    await handleFinanceCommand(event, userMsg, userId);
    return;
  }

  // ยังไม่ยินยอม -> ตรวจสอบคำตอบ
  if (userMsg === 'ยอมรับ') {
    console.log(`✅ User ${userId} accepted consent`);
    // ✅ บันทึก consent accepted
    await saveConsentToSheet(userId, 'accepted');
    await replyMessage(event.replyToken, 
      `✅ ขอบคุณสำหรับความไว้วางใจ! 
คุณสามารถเริ่มใช้งาน Nong-Fin ได้แล้ว

พิมพ์ "ช่วยเหลือ" เพื่อดูเมนูทั้งหมด`);
  } 
  else if (userMsg === 'ไม่ยอมรับ') {
    console.log(`❌ User ${userId} rejected consent`);
    // ✅ บันทึก consent rejected
    await saveConsentToSheet(userId, 'rejected');
    await replyMessage(event.replyToken, 
      `❌ ขออภัย คุณต้องยอมรับข้อตกลงก่อนจึงจะใช้งาน Nong-Fin ได้
หากเปลี่ยนใจ สามารถพิมพ์ "ยอมรับ" ได้ตลอดเวลา`);
  }
  else {
    // ข้อความอื่นๆ -> ส่ง consent form อีกครั้ง
    console.log(`📋 Sending consent form to user ${userId}`);
    await sendConsentForm(event.replyToken, userId);
  }
}

// ฟังก์ชันดูประวัติ Consent ของ user (สำหรับ debugging)
export async function getUserConsentHistory(userId) {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
    });
    
    const rows = response.data.values || [];
    
    // หาทุก record ของ Line ID นี้
    const userRecords = rows.filter(row => row[3] === userId);
    return userRecords.map(record => ({
      timestamp: record[0],
      consentResult: record[5]
    }));
  } catch (error) {
    console.error('❌ Error getting user consent history:', error.message);
    return [];
  }
}
