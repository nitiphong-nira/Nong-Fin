// ใน router.js
let botPaused = false;

class MessageRouter {
  async handleMessage(event) {
    const userMessage = event.message.text;
    const userId = event.source.userId;
    
    // ตรวจสอบคำสั่งหยุด
    if (userMessage === '!หยุด' && userId === ADMIN_ID) {
      botPaused = true;
      return 'บอทหยุดทำงานชั่วคราว';
    }
    
    if (botPaused && userId !== ADMIN_ID) {
      return 'บอทกำลังปิดปรับปรุง';
    }
    
    // ทำงานปกติ...
  }
}
