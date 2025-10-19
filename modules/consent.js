// modules/consent.js
const { google } = require('googleapis');
const { replyMessage } = require('../utils/reply');
const path = require('path');
const fs = require('fs');

// Path ไปยัง JSON key ของ Service Account
const KEYFILEPATH = path.join(__dirname, '../keys/nong-fin-7afd3f9f52e4.json');

// Spreadsheet ID ของ Google Sheet
const SPREADSHEET_ID = '13BHy3XWsSQQAzFXA8jBL1XRAor_0ZQeUfEmGw0pqPbo';
const SHEET_NAME = 'Sheet1'; // ชื่อ sheet

// สร้าง Google Sheets client
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// --- เช็ค consent ของ userId ใน Google Sheet ---
async function checkConsent(lineId) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:F`, // ข้อมูลเริ่มจาก row 2
    });

    const rows = res.data.values || [];
    const userRow = rows.find(row => row[3] === lineId); // column D = line ID
    if (!userRow) return null; // ยังไม่ consent
    return userRow[5]; // column F = consent result
  } catch (err) {
    console.error('❌ Error checking consent:', err);
    return null;
  }
}

// --- บันทึก consent ลง Google Sheet ---
async function saveConsent({ timestamp, name, surname, lineId, phone, consentResult }) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[timestamp, name, surname, lineId, phone, consentResult]],
      },
    });
  } catch (err) {
    console.error('❌ Error saving consent:', err);
  }
}

// --- ฟังก์ชันหลักจัดการ consent ---
async function handleConsent(userId, text, userStates) {
  try {
    const existingConsent = await checkConsent(userId);

    if (!existingConsent) {
      // ยังไม่เคย consent
      userStates[userId] = { consent: false };

      const pdpaNotice = `
📜 **นโยบายความเป็นส่วนตัว (PDPA Consent)**

น้องฟินจะเก็บและใช้ข้อมูลต่อไปนี้เพื่อให้บริการ:
• ข้อความที่คุณพิมพ์ในแชท  
• ข้อมูลผู้ใช้ (LINE userId)  
• คำตอบในการคำนวณหรือวางแผนการเงิน  

ข้อมูลจะถูกเก็บไว้เพื่อ:
✅ ให้คำแนะนำด้านการเงินส่วนบุคคล  
✅ ปรับปรุงบริการและประสบการณ์การใช้งาน  
❌ จะไม่เปิดเผยแก่บุคคลที่สามโดยไม่ได้รับอนุญาต  

อ่านรายละเอียดนโยบายเต็มได้ที่:  
👉 https://www.notion.so/Privacy-Policy-28b3d2318ce980b98771db7919f6ff20?source=copy_link  

คุณยินยอมให้น้องฟินเก็บข้อมูลส่วนตัวเพื่อให้บริการหรือไม่?

1️⃣ พิมพ์ “ยินยอม”  
2️⃣ พิมพ์ “ไม่ยินยอม”
`;

      await replyMessage(userId, pdpaNotice);
      return;
    }

    // --- มี record แล้ว ---
    if (existingConsent === 'ยินยอม') {
      userStates[userId] = { consent: true };
      return; // ไม่ต้องถามซ้ำ
    } else if (existingConsent === 'ไม่ยินยอม') {
      userStates[userId] = { consent: false };
      return; // ไม่ต้องถามซ้ำ
    }

    // --- ถ้าผู้ใช้พิมพ์ตอบ consent ---
    const normalized = (text || '').trim().toLowerCase();

    if (normalized.includes('ยินยอม')) {
      userStates[userId].consent = true;
      const timestamp = new Date().toISOString();
      await saveConsent({
        timestamp,
        name: '', // ถ้าต้องกรอก
        surname: '',
        lineId: userId,
        phone: '',
        consentResult: 'ยินยอม',
      });
      await replyMessage(userId, 'ขอบคุณที่ยินยอม ❤️ น้องฟินพร้อมช่วยคุณแล้วค่ะ!');
      return;
    }

    if (normalized.includes('ไม่ยินยอม')) {
      userStates[userId].consent = false;
      const timestamp = new Date().toISOString();
      await saveConsent({
        timestamp,
        name: '',
        surname: '',
        lineId: userId,
        phone: '',
        consentResult: 'ไม่ยินยอม',
      });
      await replyMessage(userId, 'น้องฟินจะไม่เก็บข้อมูลของคุณ ขอบคุณที่แวะมานะคะ 🙏');
      return;
    }

    await replyMessage(userId, `
📜 **นโยบายความเป็นส่วนตัว (PDPA Consent)**

น้องฟินจะเก็บและใช้ข้อมูลต่อไปนี้เพื่อให้บริการ:
• ข้อความที่คุณพิมพ์ในแชท  
• ข้อมูลผู้ใช้ (LINE userId)  
• คำตอบในการคำนวณหรือวางแผนการเงิน  

ข้อมูลจะถูกเก็บไว้เพื่อ:
✅ ให้คำแนะนำด้านการเงินส่วนบุคคล  
✅ ปรับปรุงบริการและประสบการณ์การใช้งาน  
❌ จะไม่เปิดเผยแก่บุคคลที่สามโดยไม่ได้รับอนุญาต  

อ่านรายละเอียดนโยบายเต็มได้ที่:  
👉 https://www.notion.so/Privacy-Policy-28b3d2318ce980b98771db7919f6ff20?source=copy_link  

คุณยินยอมให้น้องฟินเก็บข้อมูลส่วนตัวเพื่อให้บริการหรือไม่?

1️⃣ พิมพ์ “ยินยอม”  
2️⃣ พิมพ์ “ไม่ยินยอม”
`);
  } catch (err) {
    console.error('❌ Error in handleConsent:', err);
    await replyMessage(userId, 'ขออภัยค่ะ ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง 🙏');
  }
}

module.exports = { handleConsent };
