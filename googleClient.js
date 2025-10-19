const { google } = require('googleapis');
const path = require('path');

// Path ของไฟล์ JSON key
const KEYFILEPATH = path.join(__dirname, 'keys/nong-fin-7afd3f9f52e4.json');

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const sheets = google.sheets({ version: 'v4', auth });

module.exports = { sheets };
