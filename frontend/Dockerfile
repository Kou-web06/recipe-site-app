# frontend/Dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# 開発用サーバーを起動
CMD ["npm", "run", "dev"]