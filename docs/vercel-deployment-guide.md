# Vercelデプロイメントガイド

## 📋 概要

このドキュメントでは、5分気晴らしアプリをVercelにデプロイする手順と注意点について説明します。

## 🔍 現在の構成

### プロジェクト構造
- **フロントエンド**: React (Vite) - `frontend/`ディレクトリ
- **バックエンド**: Vercel Functions - `api/`ディレクトリ
- **従来のバックエンド**: Express.js - `backend/`ディレクトリ（ローカル開発用に保持）

### 重要なファイル
- `vercel.json`: Vercelの設定ファイル
- `api/package.json`: Vercel Functions用の依存関係
- `frontend/`: Reactアプリケーション

## 🔑 必要な環境変数

### 必須の環境変数
```bash
# Gemini API（必須）
GEMINI_API_KEY=your-gemini-api-key-here

# Google Cloud TTS（オプション - 有効化する場合は必須）
GCP_TTS_ENABLED=true
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

### オプションの環境変数
```bash
# ログレベル
LOG_LEVEL=info

# レート制限
RATE_LIMIT_MAX=100
```

## ⚠️ デプロイ前の注意事項

### 1. API構造の確認
- **Vercel Functions形式**: `api/v1/`ディレクトリ内の各ファイルがエンドポイント
  - `suggestions.ts` → `/api/v1/suggestions`
  - `tts.ts` → `/api/v1/tts`
  - `health.ts` → `/api/v1/health`
  - `debug.ts` → `/api/v1/debug`（開発用）

### 2. 環境変数の形式
- **GOOGLE_APPLICATION_CREDENTIALS_JSON**: 
  - JSONファイルの内容を**1行に圧縮**して設定
  - 改行やスペースを削除
  - 例: `{"type":"service_account","project_id":"..."}`

### 3. キャッシュ設定
- `vercel.json`で以下のキャッシュ制御が設定済み：
  - 静的アセット: 1年間キャッシュ
  - index.html, SW関連: キャッシュ無効化
  - APIレスポンス: キャッシュ無効化ヘッダー付き

### 4. SPAルーティング
- `vercel.json`のrewritesでSPAルーティングを設定済み
- すべての非APIリクエストは`index.html`にリダイレクト

## 📝 デプロイ前チェックリスト

### ローカル確認
- [ ] `vercel dev`でローカル動作確認
- [ ] すべてのAPIエンドポイントが正常に動作
- [ ] 環境変数が正しく読み込まれている
- [ ] ビルドエラーがない

### コード確認
- [ ] 最新のコードがGitHubにプッシュ済み
- [ ] 不要なデバッグコードが削除されている
- [ ] APIキーがハードコードされていない
- [ ] エラーハンドリングが適切

### 設定確認
- [ ] `vercel.json`の設定が正しい
- [ ] `api/package.json`の依存関係が最新
- [ ] Node.jsバージョンが20.x以上

## 🚀 デプロイ手順

### 1. Vercel CLIを使用する場合

```bash
# Vercel CLIのインストール（未インストールの場合）
npm i -g vercel

# プロジェクトルートで実行
vercel

# 初回は以下の質問に答える：
# - Set up and deploy "~/projects/kibarashi-app"? → Yes
# - Which scope do you want to deploy to? → 自分のアカウントを選択
# - Link to existing project? → No（新規作成）
# - What's your project's name? → kibarashi-app
# - In which directory is your code located? → ./ （デフォルト）

# 環境変数の設定
vercel env add GEMINI_API_KEY production
# プロンプトで実際のAPIキーを入力

# TTSを使用する場合
vercel env add GCP_TTS_ENABLED production
vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON production
vercel env add GOOGLE_CLOUD_PROJECT_ID production

# 本番デプロイ
vercel --prod
```

### 2. Vercel Webダッシュボードを使用する場合

1. [Vercel](https://vercel.com)にログイン
2. "New Project"をクリック
3. GitHubリポジトリ（CaCC-Lab/kibarashi-app）を選択
4. プロジェクト設定：
   - Framework Preset: `Other`
   - Build Command: デフォルト（vercel.jsonの設定を使用）
   - Output Directory: デフォルト（vercel.jsonの設定を使用）
5. 環境変数を設定：
   - Environment Variables セクションで追加
   - `GEMINI_API_KEY`（必須）
   - その他必要な変数
6. "Deploy"をクリック

## 🔍 デプロイ後の確認

### 基本動作確認
1. デプロイされたURLにアクセス
2. 提案の生成が正常に動作することを確認
3. 音声ガイドが再生されることを確認（TTS有効時）
4. オフライン動作を確認（PWA）

### デバッグ確認
```bash
# デバッグエンドポイントで環境変数の状態を確認
curl https://kibarashi-app.vercel.app/api/v1/debug?debug=true

# ヘルスチェック
curl https://kibarashi-app.vercel.app/api/v1/health
```

### ログ確認
```bash
# Vercel CLIでログを確認
vercel logs --follow

# または、Vercelダッシュボードの"Functions"タブでログを確認
```

## 🐛 トラブルシューティング

### 1. 環境変数が読み込まれない
- Vercelダッシュボードで環境変数が正しく設定されているか確認
- 環境変数を追加/変更後は再デプロイが必要

### 2. APIエラー（500エラー）
- Vercel Functionsのログを確認
- 環境変数（特にGEMINI_API_KEY）が正しく設定されているか確認
- `api/package.json`の依存関係が正しくインストールされているか確認

### 3. CORSエラー
- フロントエンドのAPI URLが正しく設定されているか確認
- 本番環境では相対パスを使用（`window.location.origin`）

### 4. ビルドエラー
- Node.jsバージョンが20.x以上か確認
- `npm install`が正常に完了しているか確認
- TypeScriptのコンパイルエラーがないか確認

### 5. 音声生成エラー
- GCP認証情報が正しくJSON形式で設定されているか確認
- JSONが1行に圧縮されているか確認
- プロジェクトIDが正しいか確認

## 📊 パフォーマンス最適化

### 現在の最適化
- 静的アセットの長期キャッシュ
- コード分割（React.lazy）
- Service Workerによるオフライン対応
- Vercel Edge Networkによる配信

### 推奨事項
- Vercel Analyticsの有効化（パフォーマンス監視）
- Web Vitalsの定期的な確認
- 画像の最適化（必要に応じて）

## 🔄 継続的デプロイ

GitHubとの連携により、以下が自動化されます：
- `main`ブランチへのプッシュ → 本番環境へ自動デプロイ
- プルリクエスト → プレビューデプロイ
- コミットごとにユニークなプレビューURL生成

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel CLI](https://vercel.com/docs/cli)

---

最終更新: 2025/06/28