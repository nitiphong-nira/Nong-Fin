import { replyMessage } from './utils.js';
import { getSheetsClient } from './sheets.js';

// Memory fallback
const memoryConsents = new Map();

// ฟังก์ชันบันทึก Consent (ลองใช้ Sheets ก่อน)
async function saveConsentToSheet(userId, consentResult) {
  try {
    const sheets = await getSheetsClient();
    if (!sheets) {
      throw new Error('Sheets not available');
    }
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Finway_PDPA_Consent!A:F',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          new Date().toISOString(),
          '', '', userId, '', consentResult
        ]]
      }
    });
    
    console.log(`✅ Consent saved to Sheets: ${userId}`);
    return true;
  } catch (error) {
    console.warn('⚠️ Cannot save to Sheets, using memory:', error.message);
    // Fallback to memory
    if (consentResult === 'accepted') {
      memoryConsents.set(userId, true);
    }
    return false;
  }
}

// ตรวจสอบ Consent (ลองใช้ Sheets ก่อน)
async function getUserConsentFromSheet(userId) {
  try {
    const sheets = await getSheetsClient();
    if (!sheets) {
      throw new Error('Sheets not available');
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Finway_PDPA_Consent!A:F',
    });
    
    const rows = response.data.values || [];
    const userAccepted = rows.find(row => row[3] === userId && row[5] === 'accepted');
    
    return userAccepted ? { consented: true } : null;
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
  
  if (hasConsented) {
    const { handleFinanceCommand } = await import('./finance.js');
    await handleFinanceCommand(event, userMsg, userId);
    return;
  }

  if (userMsg === 'ยอมรับ') {
    await saveConsentToSheet(userId, 'accepted');
    await replyMessage(event.replyToken, `✅ ขอบคุณ! สามารถใช้งานได้แล้ว`);
  } 
  else if (userMsg === 'ไม่ยอมรับ') {
    await saveConsentToSheet(userId, 'rejected');
    await replyMessage(event.replyToken, `❌ ต้องยอมรับก่อนจึงจะใช้งานได้`);
  }
  else {
    await sendConsentForm(event.replyToken, userId);
  }
}
