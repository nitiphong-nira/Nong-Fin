import app from './app.js';

const rawPort = process.env.PORT;
const PORT = parseInt(rawPort, 10) || 3000;

// ตรวจสอบ environment variables แบบเร็วขึ้น
if (process.env.NODE_ENV === 'production') {
  const required = ['CHANNEL_ACCESS_TOKEN', 'CHANNEL_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
}

// Start server ทันทีโดยไม่รอ Google Sheets ใน callback
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Nong-Fin bot running on port ${PORT}`);
  console.log(`📍 Health: http://0.0.0.0:${PORT}/`);
  console.log(`⏰ Startup time: ${process.uptime().toFixed(2)}s`);
});

// Initialize Google Sheets ในพื้นหลัง (ไม่บล็อก startup)
import('./modules/sheets.js')
  .then(async (sheets) => {
    try {
      await sheets.initGoogle();
      console.log('✅ Google Sheets ready (background init)');
    } catch (err) {
      console.warn('⚠️ Google Sheets delayed:', err.message);
    }
  })
  .catch(err => {
    console.warn('📦 Sheets module load deferred:', err.message);
  });

// Graceful shutdown สำหรับ Railway
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
