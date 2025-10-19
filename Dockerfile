FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
ENV PORT=8080
CMD ["node", "index.js"]
