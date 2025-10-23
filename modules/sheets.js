import { google } from 'googleapis';

let sheetsClient = null;

export async function initGoogle() {
  if (sheetsClient) return sheetsClient;

  try {
    // ใช้ API Key แทน Service Account
    const auth = new google.auth.GoogleAuth({
      keyFile: null, // ไม่ใช้ key file
      credentials: null, // ไม่ใช้ credentials
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      // ใช้ API Key จาก environment variable
      key: process.env.GOOGLE_API_KEY
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('🔧 Google Sheets ready (API Key)');
    return sheetsClient;
  } catch (err) {
    console.error('❌ Google Sheets API Key failed:', err.message);
    // ยังใช้ memory fallback ได้
    return null;
  }
}

export async function getSheetsClient() {
  if (!sheetsClient) {
    await initGoogle();
  }
  return sheetsClient;
}
