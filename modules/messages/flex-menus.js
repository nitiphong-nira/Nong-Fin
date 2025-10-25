function createMainMenu() {
  return {
    type: "flex",
    altText: "เมนูหลัก",
    contents: {
      type: "carousel",
      contents: [
        // แต่ละ bubble คือ 1 เมนู
        {
          type: "bubble",
          body: {
            type: "box",
            contents: [
              {
                type: "text", 
                text: "📊 คำนวณภาษี"
              }
            ]
          }
        }
        // ... เมนูอื่นๆ
      ]
    }
  };
}
