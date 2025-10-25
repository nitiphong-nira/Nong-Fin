function createConsentFlex() {
  return {
    type: "flex",
    altText: "คำขอการยินยอม",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        contents: [
          {
            type: "text",
            text: "กรุณายินยอมข้อกำหนดก่อนใช้งาน"
          }
        ]
      },
      footer: {
        type: "box",
        contents: [
          {
            type: "button",
            action: {
              type: "message",
              label: "✅ ยินยอม",
              text: "ยินยอม"
            }
          }
        ]
      }
    }
  };
}
