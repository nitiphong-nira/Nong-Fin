function createConsentFlex() {
  return {
    type: "flex",
    altText: "คำขอการยินยอม PDPA",
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📜 นโยบายความเป็นส่วนตัว (PDPA Consent)",
            weight: "bold",
            size: "lg",
            color: "#FFFFFF"
          }
        ],
        backgroundColor: "#FF6B6B"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "น้องฟินจะเก็บและใช้ข้อมูลต่อไปนี้เพื่อให้บริการ:",
            weight: "bold",
            size: "sm",
            margin: "md"
          },
          {
            type: "text",
            text: "• ข้อความที่คุณพิมพ์ในแชท\n• ข้อมูลผู้ใช้ (LINE userId)\n• คำตอบในการคำนวณหรือวางแผนการเงิน",
            size: "sm",
            color: "#666666",
            margin: "sm",
            wrap: true
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "ข้อมูลจะถูกเก็บไว้เพื่อ:",
            weight: "bold",
            size: "sm",
            margin: "lg"
          },
          {
            type: "text", 
            text: "✅ ให้คำแนะนำด้านการเงินส่วนบุคคล\n✅ ปรับปรุงบริการและประสบการณ์การใช้งาน\n❌ จะไม่เปิดเผยแก่บุคคลที่สามโดยไม่ได้รับอนุญาต",
            size: "sm",
            color: "#666666",
            margin: "sm",
            wrap: true
          },
          {
            type: "text",
            text: "อ่านรายละเอียดนโยบายเต็มได้ที่:\n👉 https://www.notion.so/Privacy-Policy-28b3d2318ce980b98771db7919f6ff20",
            size: "sm",
            color: "#666666",
            margin: "lg",
            wrap: true
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "text",
            text: "คุณยินยอมให้น้องฟินเก็บข้อมูลส่วนตัวเพื่อให้บริการหรือไม่?",
            weight: "bold",
            size: "sm",
            margin: "lg",
            wrap: true
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "message",
              label: "1️⃣ ยินยอม",
              text: "ยินยอม"
            },
            style: "primary",
            color: "#4CAF50"
          },
          {
            type: "button", 
            action: {
              type: "message",
              label: "2️⃣ ไม่ยินยอม",
              text: "ไม่ยินยอม"
            },
            style: "primary",
            color: "#F44336",
            margin: "sm"
          }
        ]
      }
    }
  };
}

module.exports = { createConsentFlex };
