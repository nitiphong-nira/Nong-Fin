function createAdminAlert(message) {
  return {
    type: "text",
    text: `🚨 แจ้งเตือน Admin: ${message}`
  };
}
