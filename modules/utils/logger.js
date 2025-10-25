class Logger {
  static info(message) {
    console.log(`📝 ${new Date().toISOString()}: ${message}`);
  }

  static error(message) {
    console.error(`❌ ${new Date().toISOString()}: ${message}`);
  }
}

module.exports = Logger;
