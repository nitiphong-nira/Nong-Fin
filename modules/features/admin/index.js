class AdminFeature {
  async handle(event) {
    // รับคำถามจาก user ส่งให้ admin
    await this.forwardToAdmin(event);
    return "📨 ส่งคำถามให้ Admin แล้ว คอยตอบกลับนะคะ";
  }

  async forwardToAdmin(event) {
    // ส่งคำถามไปหา Admin
  }
}

module.exports = new AdminFeature();
