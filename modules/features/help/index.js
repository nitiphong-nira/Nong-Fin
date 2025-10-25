class HelpFeature {
  async handle(event) {
    return {
      type: "text",
      text: "📞 ช่วยเหลือ\n\nติดต่อ Admin: @admin\nหรือส่งคำถามมาได้เลยค่ะ"
    };
  }
}

module.exports = new HelpFeature();
