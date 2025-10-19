# ใช้ Node.js ล่าสุด
FROM node:22

# ตั้ง working directory
WORKDIR /app

# คัดลอกไฟล์ package.json และติดตั้ง dependency
COPY package*.json ./
RUN npm install --production

# คัดลอก source code ทั้งหมด
COPY . .

# กำหนด environment port (Cloud Run ใช้ PORT ของมันเอง)
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/keys/nong-fin-7afd3f9f52e4.json
ENV PORT=8080

# รัน bot
CMD ["node", "index.js"]
