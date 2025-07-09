const express = require('express');
const cors = require('cors');
const suggestionsHandler = require('./api/v1/suggestions');

const app = express();
const PORT = 3004;

// CORS設定
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// APIエンドポイント
app.get('/api/v1/suggestions', (req, res) => {
  console.log('API Request received:', req.method, req.url);
  console.log('Query params:', req.query);
  
  // Express.js の Request/Response オブジェクトを使用
  suggestionsHandler(req, res);
});

// 健康チェック用エンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});