function createUserInfoForm() {
  return {
    type: "flex",
    altText: "กรอกข้อมูลส่วนตัว",
    contents: {
      type: "bubble",
      body: {
        type: "box", 
        contents: [
          {
            type: "text",
            text: "กรุณากรอกข้อมูลส่วนตัว"
          }
        ]
      }
    }
  };
}
