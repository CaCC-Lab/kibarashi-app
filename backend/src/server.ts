import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './api/middleware/errorHandler.js';
import { rateLimiter } from './api/middleware/rateLimit.js';
import { logger } from './utils/logger.js';
import routes from './api/routes/index.js';

// 環境変数の読み込み
dotenv.config();

// Gemini APIキーの確認
if (!process.env.GEMINI_API_KEY) {
  logger.warn('GEMINI_API_KEY is not set. Using fallback suggestions.');
}

const app = express();
const PORT = process.env.PORT || 8080;

// ミドルウェアの設定
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// レート制限
app.use('/api/', rateLimiter);

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

// エラーハンドリング
app.use(errorHandler);

// サーバー起動
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured (using fallback)'}`);
  logger.info(`TTS API: ${process.env.GCP_TTS_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
});