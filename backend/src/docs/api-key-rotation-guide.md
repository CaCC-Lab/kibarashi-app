# Gemini API キーローテーション機能ガイド

## 概要

このガイドでは、Gemini APIのレート制限や使用量制限に対応するため、複数のAPIキーを自動的にローテーションする機能について説明します。

## 機能の目的

1. **サービス継続性の確保**: 1つのAPIキーがレート制限に達しても、他のキーで処理を継続
2. **可用性の向上**: 複数のGoogle アカウントのAPIキーを活用してリスク分散
3. **自動回復**: クールダウン期間後の自動復旧
4. **監視・管理**: APIキーの使用状況をリアルタイムで監視

## セットアップ手順

### 1. 環境変数の設定

`.env`ファイルに複数のAPIキーを設定します：

```bash
# 複数のGemini APIキー（推奨：3つ以上）
GEMINI_API_KEY_1=your-first-gemini-api-key-from-account-1
GEMINI_API_KEY_2=your-second-gemini-api-key-from-account-2
GEMINI_API_KEY_3=your-third-gemini-api-key-from-account-3

# 従来のキー（後方互換性のため、任意）
GEMINI_API_KEY=your-primary-gemini-api-key

# ローテーション設定
GEMINI_KEY_ROTATION_ENABLED=true
GEMINI_RETRY_ATTEMPTS=3
GEMINI_COOLDOWN_MINUTES=60
```

### 2. APIキーの取得方法

各Googleアカウントで以下の手順を実行してください：

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. 「Create API Key」をクリック
3. 新しいプロジェクトを作成するか、既存のプロジェクトを選択
4. 生成されたAPIキーをコピーして環境変数に設定

### 3. 設定パラメータの説明

| パラメータ | 説明 | デフォルト値 | 推奨値 |
|-----------|------|-------------|--------|
| `GEMINI_KEY_ROTATION_ENABLED` | ローテーション機能の有効/無効 | `false` | `true` |
| `GEMINI_RETRY_ATTEMPTS` | 失敗時の最大再試行回数 | `3` | `3` |
| `GEMINI_COOLDOWN_MINUTES` | レート制限時のクールダウン時間（分） | `60` | `60` |

## 動作仕様

### ローテーション戦略

1. **最少使用頻度ベース**: 最も使用頻度の低いキーを優先的に選択
2. **失敗回数監視**: 連続失敗回数が閾値を超えたキーを自動的にクールダウン
3. **レート制限検知**: HTTP 429エラーやクォータエラーを検知して即座にローテーション

### エラーハンドリング

```typescript
// レート制限エラーの検知パターン
const isRateLimitError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return message.includes('rate limit') || 
         message.includes('quota') || 
         message.includes('429') ||
         message.includes('resource has been exhausted');
};
```

### フォールバック動作

1. **全キーがクールダウン中**: 最も早く回復予定のキーを使用
2. **ローテーション失敗**: 従来のキー（`GEMINI_API_KEY`）にフォールバック
3. **完全失敗**: エラーを上位レイヤーに伝播

## 管理・監視機能

### APIエンドポイント

#### 1. キー状況確認
```bash
GET /api/v1/admin/api-keys/status
```

レスポンス例：
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalKeys": 3,
      "availableKeys": 2,
      "totalRequests": 1250,
      "successfulRequests": 1198,
      "successRate": "95.8%",
      "keyRotations": 15,
      "rateLimitHits": 3
    },
    "keyDetails": [
      {
        "index": 0,
        "lastUsed": "2024-01-15T10:30:00Z",
        "failureCount": 0,
        "isOnCooldown": false,
        "cooldownUntil": null,
        "status": "AVAILABLE"
      }
    ]
  }
}
```

#### 2. 手動ローテーション
```bash
POST /api/v1/admin/api-keys/rotate
```

#### 3. クールダウンリセット（緊急時用）
```bash
POST /api/v1/admin/api-keys/reset-cooldowns
```

### 管理画面

フロントエンド管理画面（`/admin/api-keys`）で以下の情報を確認できます：

- リアルタイムキー状況
- 使用統計グラフ
- 手動操作ボタン
- 自動更新（30秒間隔）

## ベストプラクティス

### 1. APIキーの管理

- **アカウント分離**: 異なるGoogleアカウントでキーを作成
- **プロジェクト分離**: 各キーを別々のGCPプロジェクトで管理
- **ローテーション**: 定期的にキーを新しいものに更新

### 2. 監視とアラート

```typescript
// 推奨アラート条件
const alertConditions = {
  availableKeys: 1,           // 利用可能キーが1個以下
  successRate: 90,            // 成功率が90%以下
  rateLimitHitsPerHour: 5     // 時間あたりレート制限回数が5回以上
};
```

### 3. 本番運用

- **最小3キー**: 冗長性確保のため最低3つのキーを推奨
- **クォータ監視**: 各アカウントの月次クォータを監視
- **ログ分析**: 定期的にローテーションパターンを分析

## トラブルシューティング

### よくある問題

#### 1. 全キーが利用不可
```bash
# 症状
Error: No available API keys

# 対処法
curl -X POST http://localhost:8080/api/v1/admin/api-keys/reset-cooldowns
```

#### 2. ローテーションが動作しない
```bash
# 環境変数を確認
echo $GEMINI_KEY_ROTATION_ENABLED
echo $GEMINI_API_KEY_1

# 設定を確認
curl http://localhost:8080/api/v1/admin/api-keys/status
```

#### 3. レート制限が頻発
- APIキー数を増やす
- クールダウン時間を延長
- リクエスト間隔を調整

### ログ分析

```bash
# キーローテーション関連のログを確認
docker logs kibarashi-backend 2>&1 | grep "API key"

# エラーパターンの分析
docker logs kibarashi-backend 2>&1 | grep "rate limit"
```

## セキュリティ考慮事項

1. **環境変数の保護**: `.env`ファイルをGitにコミットしない
2. **アクセス制限**: 管理エンドポイントに認証を実装
3. **ログ配慮**: APIキーの値をログに出力しない
4. **定期ローテーション**: APIキー自体を定期的に更新

## パフォーマンス影響

- **レイテンシ**: ローテーション時に1-2秒の追加遅延
- **メモリ**: キー管理用に約1MB追加
- **CPU**: 統計処理による微小な負荷増加

## 今後の拡張予定

1. **動的スケーリング**: 負荷に応じたキー数の自動調整
2. **予測的ローテーション**: 使用量パターンに基づく事前ローテーション
3. **外部監視連携**: Prometheus、Grafanaとの統合
4. **自動キー管理**: GCP APIを使用したキーの自動作成・削除