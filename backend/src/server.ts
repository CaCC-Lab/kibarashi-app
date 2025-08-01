import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './api/middleware/errorHandler';
import { rateLimiter } from './api/middleware/rateLimit';
import { logger } from './utils/logger';
import routes from './api/routes/index';

// 環境変数の読み込み
dotenv.config();

// Gemini APIキーの確認
if (!process.env.GEMINI_API_KEY) {
  logger.warn('GEMINI_API_KEY is not set. Using fallback suggestions.');
}

const app = express();
const PORT = process.env.PORT || 8080;

// ミドルウェアの設定
// CORSを最初に設定（helmetよりも前）
app.use(cors({
  origin: function(origin, callback) {
    // 開発環境では全てのオリジンを許可
    if (process.env.NODE_ENV === 'development' || !origin) {
      callback(null, true);
    } else {
      const allowedOrigins = process.env.CORS_ORIGIN ? 
        process.env.CORS_ORIGIN.split(',') : 
        ['http://localhost:3000', 'http://localhost:3001'];
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// 基本レート制限（全エンドポイント共通）
app.use('/api/', rateLimiter.suggestions);

// ルーティング
app.use('/api/v1', routes);

// ヘルスチェック
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    ttsEnabled: process.env.GCP_TTS_ENABLED === 'true'
  });
});

// 404ハンドラー（すべてのルートの後に配置）
app.use('*', (_req, res) => {
  res.status(404).json({
    error: {
      message: 'リソースが見つかりません',
      reason: '要求された情報が存在しないか、削除された可能性があります。',
      solution: 'URLが正しいか確認してください。',
      statusCode: 404
    }
  });
});

// エラーハンドリング
app.use(errorHandler);

// サーバー起動
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured (using fallback)'}`);
  logger.info(`TTS API: ${process.env.GCP_TTS_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
});

// エクスポート（テスト用）
export default server;
export { app };