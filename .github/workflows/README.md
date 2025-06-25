# GitHub Actions ワークフロー

## アクティブなワークフロー

- **deploy-vercel.yml** - Vercelへの自動デプロイ（メインプラットフォーム）
- **ci.yml** - CI/CD（テスト、ビルド、Lint）
- **dependencies.yml** - 依存関係の自動更新

## 無効化されたワークフロー

以下のワークフローは現在使用していないため、`.disabled`拡張子を付けて無効化しています：

- **azure-deploy.yml.disabled** - Azure Static Web Appsへのデプロイ
- **azure-static-web-apps.yml.disabled** - Azure Static Web Appsへの詳細デプロイ
- **deploy.yml.disabled** - Firebase Hostingへのデプロイ

## 理由

プロジェクトのデプロイメントプラットフォームをVercelに統一したため、他のプラットフォームへのデプロイワークフローは無効化しました。これにより：

1. 不要なビルドエラーを防止
2. GitHub Actionsの実行時間を節約
3. デプロイメント先の明確化

## 再有効化方法

必要に応じて、`.disabled`拡張子を削除することでワークフローを再有効化できます：

```bash
# 例：Firebaseデプロイを再有効化
mv deploy.yml.disabled deploy.yml
```