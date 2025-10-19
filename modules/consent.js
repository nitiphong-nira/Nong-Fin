// modules/consent.js
const { replyMessage } = require('../utils/reply');

async function handleConsent(userId, text, userStates) {
  try {
    // --- ถ้ายังไม่เคยตอบ consent ---
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

      await replyMessage(userId, pdpaNotice);
      return;
    }

    const normalized = (text || '').trim().toLowerCase();

    // --- ถ้าผู้ใช้พิมพ์ "ยินยอม" ---
    if (normalized.includes('ยินยอม')) {
      userStates[userId].consent = true;
      await replyMessage(userId, 'ขอบคุณที่ยินยอม ❤️ น้องฟินพร้อมช่วยคุณแล้วค่ะ!');
      return;
    }

    // --- ถ้าผู้ใช้พิมพ์ "ไม่ยินยอม" ---
    if (normalized.includes('ไม่ยินยอม')) {
      userStates[userId].consent = false;
      await replyMessage(userId, 'น้องฟินจะไม่เก็บข้อมูลของคุณ ขอบคุณที่แวะมานะคะ 🙏');
      return;
    }

    // --- กรณีผู้ใช้พิมพ์อย่างอื่น ---
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
