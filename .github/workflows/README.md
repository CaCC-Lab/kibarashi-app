# GitHub Actions ワークフロー

このディレクトリには、CI/CDパイプライン用のGitHub Actionsワークフローが含まれています。

## ワークフロー一覧

### 1. azure-static-web-apps.yml
Azure Static Web Appsへの自動デプロイを行うメインワークフロー。

**トリガー:**
- mainブランチへのpush
- mainブランチへのPull Request
- 手動実行（workflow_dispatch）

**主な処理:**
- Node.js 20.xでのビルドとテスト
- Azure Static Web Appsへのデプロイ
- PR環境の自動作成と削除

**必要なシークレット:**
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Azureポータルから取得
- `VITE_API_URL`: 本番環境のAPI URL（オプション）

### 2. ci.yml
開発中の継続的インテグレーション用ワークフロー。

**トリガー:**
- main/developブランチへのpush
- main/developブランチへのPull Request

**主な処理:**
- ESLintによるコード品質チェック
- Vitest/Jestによるユニットテスト実行
- カバレッジレポートの生成
- ビルドの検証
- セキュリティスキャン（npm audit）

## セットアップ手順

1. **Azure Static Web Apps APIトークンの取得:**
   - Azure Portalにログイン
   - Static Web Appsリソースを作成/選択
   - 「管理」→「デプロイトークン」からトークンをコピー

2. **GitHubシークレットの設定:**
   - GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」
   - 以下のシークレットを追加:
     - `AZURE_STATIC_WEB_APPS_API_TOKEN`: 上記で取得したトークン
     - `VITE_API_URL`: 本番環境のAPI URL（例: https://kibarashi-app.azurestaticapps.net）

3. **ワークフローの有効化:**
   - mainブランチにpushすると自動的にワークフローが実行されます
   - 手動実行する場合は「Actions」タブから実行可能

## トラブルシューティング

### ビルドエラー
- Node.jsのバージョンが20.x以上であることを確認
- package-lock.jsonが最新であることを確認

### デプロイエラー
- APIトークンが正しく設定されているか確認
- Azure Static Web Appsのリソースが正しく作成されているか確認

### テストエラー
- ローカルでテストが通ることを確認
- 環境変数が正しく設定されているか確認