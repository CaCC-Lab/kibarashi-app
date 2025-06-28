# キャッシュ制御の実装

## 概要

Gemini APIから毎回新しい提案を取得するために、以下の3つの方法でキャッシュを無効化しています。

## 実装内容

### 1. URLパラメータによるキャッシュバスター

```typescript
// frontend/src/services/api/suggestions.ts
const timestamp = Date.now();
`/api/v1/suggestions?situation=${situation}&duration=${duration}&_t=${timestamp}`
```

毎回異なるタイムスタンプを付与することで、ブラウザが別のリクエストとして認識します。

### 2. HTTPヘッダーによるキャッシュ制御

#### フロントエンド側
```typescript
// frontend/src/services/api/client.ts
headers: {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
}

// fetchオプション
cache: 'no-store'
```

#### バックエンド側
```typescript
// backend/src/api/controllers/suggestionController.ts
res.set({
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
});
```

### 3. CORS設定の更新

```typescript
// backend/src/server.ts
allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
```

## キャッシュヘッダーの意味

- `no-cache`: キャッシュを使用前に必ずサーバーに確認
- `no-store`: レスポンスを一切キャッシュしない
- `must-revalidate`: 期限切れのキャッシュを使用しない
- `Pragma: no-cache`: HTTP/1.0互換性のため
- `Expires: 0`: 即座に期限切れとする

## 動作確認方法

### 1. 開発者ツールでの確認

1. ブラウザの開発者ツール（F12）を開く
2. ネットワークタブを選択
3. 「他の提案を見る」ボタンをクリック
4. リクエストヘッダーとレスポンスヘッダーを確認

確認すべき項目：
- URLに `_t` パラメータが含まれていること
- リクエストヘッダーに `Cache-Control` が含まれていること
- レスポンスヘッダーに `Cache-Control: no-cache, no-store, must-revalidate` が含まれていること

### 2. 連続クリックでの確認

1. 「他の提案を見る」ボタンを連続でクリック
2. 毎回異なる提案が表示されることを確認
3. ネットワークタブで、各リクエストのURLが異なることを確認

### 3. テストの実行

```bash
# フロントエンドのテスト
cd frontend
npm test -- cache-buster

# バックエンドの起動（ポート8081）
cd backend
PORT=8081 npm run dev

# フロントエンドの起動（ポート3000）
cd frontend
npm run dev
```

## トラブルシューティング

### CORSエラーが発生する場合

```
Access to fetch at 'http://localhost:8081/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

対処法：
1. バックエンドサーバーを再起動
2. `.env` ファイルの `CORS_ORIGIN` を確認
3. バックエンドのポートが正しいか確認

### 同じ提案が表示される場合

1. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete）
2. Service Workerを無効化または削除
3. プライベートブラウジングモードで確認
4. Gemini APIキーが正しく設定されているか確認

### デバッグ方法

```javascript
// フロントエンドでのデバッグ
console.log('API Response:', data);

// バックエンドでのデバッグ
logger.info('Generating suggestions', { situation, duration });
```

## パフォーマンスへの影響

キャッシュを完全に無効化することで、以下の影響があります：

- 毎回サーバーにリクエストが送信される
- Gemini APIが毎回呼び出される
- レスポンス時間が若干長くなる可能性がある

ただし、ユーザーが常に新しい提案を受け取れるメリットの方が大きいため、この実装を採用しています。