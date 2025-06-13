import dotenv from 'dotenv';
import path from 'path';

// テスト用環境変数の読み込み
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// テスト用のGemini APIキー設定（実際のAPIを使用）
if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set for testing. Some tests may fail.');
}

// テスト環境の設定
process.env.NODE_ENV = 'test';
process.env.PORT = '8081'; // テスト用ポート

// グローバルタイムアウトの設定
// 実際のAPIを使用するため、タイムアウトを長めに設定
globalThis.testTimeout = 30000; // 30秒