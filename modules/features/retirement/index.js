class RetirementFeature {
  async handle(event) {
    if (event.message.text === "แผนเกษียณ") {
      return this.showRetirementPlans();
    }
  }

  async showRetirementPlans() {
    return {
      type: "text", 
      text: "👵 แผนเกษียณ\n\n• RMF\n• กองทุนบำเหน็จ\n• ประกันบำนาญ\n• ออมทรัพย์เกษียณ"
    };
  }
}

module.exports = new RetirementFeature();
