const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  console.log(req.body); // ดู event ที่ LINE ส่งมา
  res.sendStatus(200);   // ต้องตอบ 200 OK
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
