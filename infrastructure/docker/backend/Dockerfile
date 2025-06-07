# 開発環境用 Dockerfile
FROM node:20.10.0-alpine

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# アプリケーションコードをコピー
COPY . .

# ポート8080を公開
EXPOSE 8080

# 開発サーバーを起動
CMD ["npm", "run", "dev"]