const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3004;

// CORS設定
app.use(cors());
app.use(express.json());

// API エンドポイント
app.get('/api/v1/suggestions', async (req, res) => {
  try {
    const { situation, duration, ageGroup, location } = req.query;
    
    console.log('API呼び出しを受信:', {
      situation,
      duration,
      ageGroup,
      location
    });
    
    // Vercel Functions のロジックを読み込み
    const suggestionHandler = require('./api/v1/suggestions');
    
    // モックのリクエストオブジェクト
    const mockReq = {
      query: req.query,
      url: req.url,
      method: req.method,
      headers: req.headers
    };
    
    // モックのレスポンスオブジェクト
    const mockRes = {
      status: (code) => ({ json: (data) => res.status(code).json(data) }),
      json: (data) => res.json(data),
      send: (data) => res.send(data)
    };
    
    // Vercel Functions ハンドラーを呼び出し
    await suggestionHandler(mockReq, mockRes);
    
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      error: {
        message: 'サーバーエラーが発生しました',
        details: error.message
      }
    });
  }
});

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// フォールバック：すべてのルートでindex.htmlを返す
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`開発サーバーが http://localhost:${PORT} で起動しました`);
});