import app from './app.js';
import { initGoogle } from './modules/sheets.js';

const rawPort = process.env.PORT;
const PORT = parseInt(rawPort, 10) || 3000;

if (process.env.NODE_ENV === 'production') {
  if (!process.env.CHANNEL_ACCESS_TOKEN || !process.env.CHANNEL_SECRET) {
    console.error('❌ Missing LINE credentials');
    process.exit(1);
  }
}

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Nong-Fin bot running on port ${PORT}`);
  
  // Load Google Sheet connection asynchronously
  try {
    await initGoogle();
    console.log('✅ Google Sheets ready');
  } catch (err) {
    console.warn('⚠️ Google Sheets failed to initialize:', err.message);
  }
});
