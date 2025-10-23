import { replyMessage } from './utils.js';
import { getSheetsClient } from './sheets.js';

const SHEET_NAME = 'Finway_PDPA_Consent';

// ฟังก์ชันบันทึก Consent
async function saveConsentToSheet(userId, consentResult) {
  try {
    const sheets = await getSheetsClient();
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [[
          new Date().toISOString(),
          '', '', userId, '', consentResult
        ]]
      }
    });
    
    console.log(`✅ Consent saved for: ${userId}`);
  } catch (error) {
    console.error('❌ Error saving consent:', error.message);
  }
}

// ตรวจสอบ Consent จาก Line ID
async function getUserConsentFromSheet(userId) {
  try {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${SHEET_NAME}!A:F`,
    });
    
    const rows = response.data.values || [];
    const userAccepted = rows.find(row => row[3] === userId && row[5] === 'accepted');
    
    return userAccepted ? { consented: true } : null;
  } catch (error) {
    console.error('❌ Error reading consent:', error.message);
    return null;
  }
}

export async function hasUserConsented(userId) {
  const consentData = await getUserConsentFromSheet(userId);
  return consentData ? consentData.consented : false;
}

export async function sendConsentForm(replyToken, userId) {
  const consentMessage = `📋 ข้อตกลงและเงื่อนไขการใช้งาน...`;
  await replyMessage(replyToken, consentMessage);
}

export async function handleConsentFlow(event, userMsg, userId) {
  const hasConsented = await hasUserConsented(userId);
  
  if (hasConsented) {
    const { handleFinanceCommand } = await import('./finance.js');
    await handleFinanceCommand(event, userMsg, userId);
    return;
  }

  if (userMsg === 'ยอมรับ') {
    await saveConsentToSheet(userId, 'accepted');
    await replyMessage(event.replyToken, `✅ ขอบคุณสำหรับความไว้วางใจ!`);
  } 
  else if (userMsg === 'ไม่ยอมรับ') {
    await saveConsentToSheet(userId, 'rejected');
    await replyMessage(event.replyToken, `❌ ขออภัย คุณต้องยอมรับข้อตกลงก่อน`);
  }
  else {
    await sendConsentForm(event.replyToken, userId);
  }
}
