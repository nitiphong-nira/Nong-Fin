const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

console.log('🚀 Starting server...');

app.get('/', (req, res) => {
  console.log('✅ Root accessed');
  res.send('Bot is running!');
});

app.post('/webhook', (req, res) => {
  console.log('✅ Webhook received');
  res.send('OK');
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
