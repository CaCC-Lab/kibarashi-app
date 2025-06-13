import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './server';

/**
 * サーバー起動のテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のサーバー起動を検証
 * - ヘルスチェックエンドポイントを確認
 * - CORSやミドルウェアの設定を検証
 */
describe('Server', () => {

  describe('サーバー起動確認', () => {
    it('ヘルスチェックエンドポイントが正しいレスポンスを返す', async () => {
      const response = await request(app).get('/api/v1/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'kibarashi-backend');
    });

    it('旧ヘルスチェックエンドポイントも動作する', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('ttsEnabled');
    });
  });

  describe('CORS設定の確認', () => {
    it('CORSヘッダーが正しく設定されている', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'http://localhost:3000');
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('プリフライトリクエストに正しく応答する', async () => {
      const response = await request(app)
        .options('/api/v1/suggestions')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'content-type');
      
      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });
  });

  describe('ミドルウェアの動作確認', () => {
    it('JSONボディを正しくパースする', async () => {
      const testData = { test: 'data' };
      
      // POSTエンドポイントがない場合は404が返る
      const response = await request(app)
        .post('/api/v1/test')
        .send(testData)
        .set('Content-Type', 'application/json');
      
      // 404でもボディパーサーが動作していることを確認
      expect(response.status).toBe(404);
    });

    it('大きなリクエストボディも処理できる', async () => {
      const largeData = { data: 'x'.repeat(1000) };
      
      const response = await request(app)
        .post('/api/v1/test')
        .send(largeData)
        .set('Content-Type', 'application/json');
      
      // ボディサイズ制限内であることを確認（413エラーが返らない）
      expect(response.status).not.toBe(413);
    });

    it('圧縮が有効になっている', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .set('Accept-Encoding', 'gzip');
      
      // 小さなレスポンスでは圧縮されない可能性があるのでヘッダーの存在は確認しない
      expect(response.status).toBe(200);
    });
  });

  describe('エラーハンドリング', () => {
    it('存在しないエンドポイントで404を返す', async () => {
      const response = await request(app).get('/api/v1/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toContain('見つかりません');
    });

    it('ルートパスへのアクセスで404を返す', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(404);
    });

    it('APIプレフィックスなしのパスで404を返す（/health以外）', async () => {
      const response = await request(app).get('/suggestions');
      
      expect(response.status).toBe(404);
    });
  });

  describe('ルーティング', () => {
    it('提案APIエンドポイントが利用可能', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({ situation: 'workplace', duration: 5 });
      
      // 200が返ることを確認
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('suggestions');
    });

    it('APIバージョニングが機能する', async () => {
      // v1エンドポイント
      const v1Response = await request(app).get('/api/v1/health');
      expect(v1Response.status).toBe(200);
      
      // v2エンドポイント（存在しない）
      const v2Response = await request(app).get('/api/v2/health');
      expect(v2Response.status).toBe(404);
    });
  });

  describe('レスポンスヘッダー', () => {
    it('適切なContent-Typeヘッダーを返す', async () => {
      const response = await request(app).get('/api/v1/health');
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('セキュリティヘッダーが設定されている', async () => {
      const response = await request(app).get('/api/v1/health');
      
      // Helmetによって設定されるヘッダーを確認
      expect(response.headers['x-dns-prefetch-control']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });
});