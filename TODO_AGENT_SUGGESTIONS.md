<!--
 このファイルはCodex CLI (ChatGPT) が提案した追加検討タスク一覧です。
-->
# 💡 追加検討タスク（Codex CLI が作成）

### 🧪 エンドツーエンドテスト（E2E）
- [ ] Playwright を使った主要ユーザーフローの E2E テスト自動化
  - [ ] シチュエーション選択から提案音声ガイド再生まで
  - [ ] カスタム気晴らし追加・削除フロー
  - [ ] お気に入り登録・履歴一覧操作
  - [ ] PWA オフラインモードでの動作検証
- [ ] Lighthouse CI の導入（CI パイプライン内でスコアチェック）

### 🔒 セキュリティ強化
- [ ] Dependabot による依存ライブラリの自動更新設定
- [ ] OWASP Top10 脆弱性チェックの定期スキャン導入
- [ ] CSP ヘッダーの更なる厳格化とレポート用エンドポイント設置
- [ ] API Rate Limiting／WAF（例: Azure Front Door, Cloudflare）対応検討

### 🌐 国際化・多言語対応
- [ ] i18next 等を用いた UI 国際化の実装
  - [ ] 英語・中国語・韓国語翻訳ファイルの作成
  - [ ] 言語切替 UI の追加
- [ ] TTS 多言語音声エンジン対応の検討（Gemini TTS 他言語オプション）
- [ ] 右→左言語（アラビア語）への対応可否検証

### 📊 分析・モニタリング
- [ ] Google Analytics 4／Sentry／Datadog 等の統合
- [ ] Cloud Functions のパフォーマンス監視設定（コールドスタート、レイテンシ計測）
- [ ] イベントトラッキング設計（カスタマージャーニー解析用）
- [ ] エラートラッキングのアラート設定

### 🌱 開発フロー・メンテナンス
- [ ] Storybook による UI コンポーネントカタログの構築
- [ ] Visual Regression Testing（Chromatic 等）検討
- [ ] commitlint／Conventional Commits 導入
- [ ] GitHub Actions に Danger.js 等のガイドラインチェックを追加

### 📋 ドキュメント強化
- [ ] OpenAPI (Swagger) による API 仕様書の自動生成
- [ ] ADR（Architecture Decision Records）の追加
- [ ] ドキュメントサイト構築（Sphinx/MkDocs 等）検討
- [ ] 開発者オンボーディングガイドの整備（セットアップ手順、コード規約まとめ）
- [ ] Accessibility Testing ガイド（Lighthouse, axe-core）追加

### 🖌️ UX/UI 微調整
- [ ] フォント可変サイズ対応（ユーザー設定による調整機能）
- [ ] レイアウトグリッド・タイポグラフィプレセットの導入
- [ ] オーディオ設定ガイド（マイク・ヘッドフォン等）追加
- [ ] ARIA 属性の網羅検証と自動チェックツール導入

### ☁️ インフラ／デプロイ
- [ ] Terraform／Pulumi によるインフラコード化（GCP, Vercel 等）
- [ ] Preview 環境の自動プロビジョニング（GitHub Preview Deployments）
- [ ] Canary／Blue-Green デプロイ検討
- [ ] Docker イメージ多段ビルドの最適化

### 📦 パッケージ管理・依存関係
- [ ] pnpm や Yarn Berry 導入検討
- [ ] パッケージアップデート自動化設定（renovate 等）

### 📐 パフォーマンス強化
- [ ] Core Web Vitals リアルユーザーモニタリング(RUM)導入
- [ ] エッジキャッシュ設定（Vercel Edge Functions／CDN）
- [ ] LCP／CLS 改善のための画像最適化自動化