FROM nginx:1.25.3-alpine

# カスタム設定ファイルをコピー
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]