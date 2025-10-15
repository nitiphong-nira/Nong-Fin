const { replyMessage } = require('../utils/reply');

function handleConsent(userId, text, userStates) {
  if (!userStates[userId]) {
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

    return replyMessage(userId, pdpaNotice);
  }

  if (text.includes('ยินยอม')) {
    userStates[userId].consent = true;
    return replyMessage(userId, 'ขอบคุณที่ยินยอม ❤️ น้องฟินพร้อมช่วยคุณแล้วค่ะ!');
  } else if (text.includes('ไม่ยินยอม')) {
    return replyMessage(userId, 'น้องฟินจะไม่เก็บข้อมูลของคุณ ขอบคุณที่แวะมานะคะ 🙏');
  } else {
    return replyMessage(userId, 'กรุณาพิมพ์ “ยินยอม” หรือ “ไม่ยินยอม” เท่านั้นค่ะ');
  }
}

module.exports = { handleConsent };
