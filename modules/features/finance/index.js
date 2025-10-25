class FinanceFeature {
  async handle(event) {
    if (event.message.text === "บันทึกรายรับรายจ่าย") {
      return this.showFinanceTools();
    }
  }

  async showFinanceTools() {
    return {
      type: "text",
      text: "💰 บันทึกรายรับรายจ่าย\n\n• เทมเพลต Excel\n• แอปแนะนำ\n• วิธีการบันทึก"
    };
  }
}

module.exports = new FinanceFeature();
