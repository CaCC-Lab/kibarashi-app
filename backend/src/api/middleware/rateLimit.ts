import rateLimit from 'express-rate-limit';

// 基本レート制限
export const rateLimiter = {
  // 通常の提案（従来）
  suggestions: rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 最大100リクエスト
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // 拡張提案（音声ガイド対応）
  enhancedSuggestions: rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分
    max: parseInt(process.env.ENHANCED_RATE_LIMIT_MAX || '50'), // 拡張提案は制限を厳しく
    message: 'Too many enhanced suggestion requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `enhanced_${req.ip}`, // 通常の提案とは別にカウント
  }),

  // 音声セグメント取得
  voiceSegment: rateLimit({
    windowMs: 60000, // 1分
    max: 200, // 音声セグメントは頻繁にアクセスされるため多めに設定
    message: 'Too many voice segment requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `voice_${req.ip}`,
  }),

  // フィードバック投稿
  feedback: rateLimit({
    windowMs: 300000, // 5分
    max: 20, // フィードバックは制限を緩く
    message: 'Too many feedback submissions. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `feedback_${req.ip}`,
  }),

  // TTS（音声合成）
  tts: rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分
    max: parseInt(process.env.TTS_RATE_LIMIT_MAX || '30'), // TTSは重い処理なので制限
    message: 'Too many text-to-speech requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `tts_${req.ip}`,
  })
};