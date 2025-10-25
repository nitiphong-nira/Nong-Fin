class InvestmentFeature {
  async handle(event) {
    const userMessage = event.message.text;
    
    if (userMessage === "แผนการลงทุน") {
      return await this.showInvestmentOptions();
    }
  }
  
  async showInvestmentOptions() {
    return {
      type: "text",
      text: "📈 แผนการลงทุนลดหย่อนภาษี\n\n• LTF\n• RMF\n• SSF\n• กองทุนรวม\n\nต้องการดูรายละเอียดไหนคะ?"
    };
  }
}

module.exports = new InvestmentFeature();
