import { google } from 'googleapis';

let sheetsClient = null;

export async function initGoogle() {
  if (sheetsClient) return sheetsClient;

  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    sheetsClient = google.sheets({ version: 'v4', auth });
    
    await initializeConsentSheet();
    console.log('🔧 Google Sheets ready');
    return sheetsClient;
  } catch (err) {
    console.error('❌ Google Sheets failed:', err.message);
    throw err;
  }
}

// เพิ่มฟังก์ชันนี้
async function initializeConsentSheet() {
  try {
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      resource: { requests: [{ addSheet: { properties: { title: 'Finway_PDPA_Consent' } } }] }
    });
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Finway_PDPA_Consent!A1:F1',
      valueInputOption: 'RAW',
      resource: { values: [['Timestamp', 'name', 'surname', 'line ID', 'Phone number', 'consent result']] }
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      console.error('❌ Error initializing sheet:', error.message);
    }
  }
}

// เพิ่มฟังก์ชันนี้
export async function getSheetsClient() {
  if (!sheetsClient) await initGoogle();
  return sheetsClient;
}
