class InsuranceFeature {
  async handle(event) {
    const userMessage = event.message.text;
    
    if (userMessage === "แผนประกัน") {
      return await this.showInsuranceOptions();
    }
  }
  
  async showInsuranceOptions() {
    return {
      type: "text",
      text: "🛡️ แผนประกันชีวิต\n\n• ประกันชีวิต\n• ประกันสุขภาพ\n• ประกันโรคร้ายแรง\n• ประกันอุบัติเหตุ\n\nสนใจประกันประเภทไหนคะ?"
    };
  }
}

module.exports = new InsuranceFeature();
