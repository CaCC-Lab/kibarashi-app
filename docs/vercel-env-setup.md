# Vercel環境変数設定ガイド

## 前提条件
- 複数のGoogleアカウントでGemini APIキーを取得済み
- Vercelプロジェクトが作成済み

## 手順1: Gemini APIキーの準備

各Googleアカウントで以下を実行：

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. 「Create API Key」をクリック
3. プロジェクトを選択（または新規作成）
4. 生成されたAPIキーをコピー・保存

**推奨**: 最低3つのAPIキーを準備

## 手順2: Vercel Dashboardでの設定

### ステップ1: プロジェクト設定画面へ
1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. `kibarashi-app` プロジェクトをクリック
3. **Settings** タブを選択
4. 左サイドバーから **Environment Variables** をクリック

### ステップ2: 環境変数を追加

以下の環境変数を順番に設定：

#### 必須設定（API キー）
| 変数名 | 値 | 環境 |
|--------|----|----- |
| `GEMINI_API_KEY_1` | 1つ目のAPIキー | Production, Preview |
| `GEMINI_API_KEY_2` | 2つ目のAPIキー | Production, Preview |
| `GEMINI_API_KEY_3` | 3つ目のAPIキー | Production, Preview |

#### ローテーション設定
| 変数名 | 値 | 環境 |
|--------|----|----- |
| `GEMINI_KEY_ROTATION_ENABLED` | `true` | Production, Preview |
| `GEMINI_RETRY_ATTEMPTS` | `3` | Production, Preview |
| `GEMINI_COOLDOWN_MINUTES` | `60` | Production, Preview |

#### 既存設定（後方互換性）
| 変数名 | 値 | 環境 |
|--------|----|----- |
| `GEMINI_API_KEY` | メインAPIキー | Production, Preview |
| `GEMINI_MODEL` | `gemini-pro` | All |
| `GEMINI_MAX_TOKENS` | `1000` | All |
| `GEMINI_TEMPERATURE` | `0.7` | All |

### ステップ3: 設定方法

各環境変数について：

1. **Add New** ボタンをクリック
2. **Name**: 変数名を入力（例：`GEMINI_API_KEY_1`）
3. **Value**: 対応する値を入力
4. **Environments**: 適用する環境を選択
   - ✅ Production
   - ✅ Preview
   - ⚪ Development（必要に応じて）
5. **Add** ボタンをクリック

## 手順3: 設定確認

### 確認方法1: ヘルスチェックAPI
デプロイ後、以下のURLにアクセス：
```
https://your-app.vercel.app/api/v1/health
```

期待される応答：
```json
{
  "status": "ok",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ",
  "service": "kibarashi-backend",
  "version": "1.1.0",
  "environment": {
    "geminiKeysConfigured": 3,
    "rotationEnabled": true,
    "ttsEnabled": true,
    "hasMinimumKeys": true
  }
}
```

### 確認方法2: 管理画面
```
https://your-app.vercel.app/admin/api-keys
```

期待される表示：
- 総キー数: 3
- 利用可能: 3
- ローテーション機能: 有効

## 手順4: デプロイとテスト

1. **再デプロイ**: 環境変数変更後、自動的に再デプロイされます
2. **動作確認**: 
   - ヘルスチェックAPIで設定確認
   - 気晴らし提案機能で実際のAPI呼び出しテスト
   - 管理画面でキー状況確認

## トラブルシューティング

### 問題1: 環境変数が反映されない
**症状**: ヘルスチェックで`geminiKeysConfigured: 0`
**解決策**: 
1. Vercel Dashboardで設定を再確認
2. 手動で再デプロイを実行
3. ブラウザキャッシュをクリア

### 問題2: APIキーが無効
**症状**: `"status": "warning"`または API呼び出しエラー
**解決策**:
1. Google AI StudioでAPIキーの有効性を確認
2. APIキーの使用制限を確認
3. 正しいAPIキーがコピーされているか確認

### 問題3: レート制限頻発
**症状**: 管理画面で`rateLimitHits`が多い
**解決策**:
1. APIキー数を増やす（4つ以上推奨）
2. `GEMINI_COOLDOWN_MINUTES`を延長（例：120）
3. 各Googleアカウントのクォータ設定を確認

## セキュリティ注意事項

1. **APIキーの管理**:
   - 定期的にローテーション（月1回推奨）
   - 不要になったキーは即座に削除
   - チーム共有は最小限に

2. **アクセス制限**:
   - Google Cloud ConsoleでAPI制限を設定
   - 特定ドメインからのアクセスのみ許可
   - 使用量アラートを設定

3. **監視**:
   - 管理画面で定期的に使用状況を確認
   - 異常なAPI使用量をモニタリング
   - ログで不正アクセスを監視

## 運用時のベストプラクティス

1. **定期チェック（週1回）**:
   - 管理画面でキー状況確認
   - エラー率・成功率の確認
   - クォータ使用量の確認

2. **月次メンテナンス**:
   - APIキーのローテーション検討
   - 使用統計の分析
   - パフォーマンス最適化

3. **アラート設定**（今後実装予定）:
   - 利用可能キーが1個以下の場合
   - エラー率が10%以上の場合
   - クォータ使用量が80%以上の場合