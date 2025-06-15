# CI/CD セットアップガイド

## 概要

このプロジェクトでは、GitHub ActionsとFirebase Hostingを使用した完全自動化されたCI/CDパイプラインを構築しています。

## ワークフロー構成

### 1. CI Pipeline (.github/workflows/ci.yml)

#### 目的
- コード品質の保証
- 自動テスト実行
- セキュリティチェック
- ビルド検証

#### 実行タイミング
- `main`、`develop`ブランチへのpush
- プルリクエスト作成時

#### ジョブ構成
1. **Lint & Type Check**: ESLintとTypeScriptの型チェック
2. **Frontend Tests**: フロントエンドのテスト実行とカバレッジ測定
3. **Backend Tests**: バックエンドのテスト実行とカバレッジ測定
4. **Build**: アプリケーションのビルド検証
5. **Security Scan**: 脆弱性スキャン（Trivy）
6. **Quality Gate**: 全ジョブの成功確認

### 2. Deploy Pipeline (.github/workflows/deploy.yml)

#### 目的
- Firebase Hostingへの自動デプロイ
- デプロイ後の健全性チェック
- 手動デプロイオプション

#### 実行タイミング
- `main`ブランチへのpush（CI成功後）
- 手動実行（workflow_dispatch）

#### ジョブ構成
1. **Quality Check**: CIパイプラインの成功確認
2. **Deploy**: Firebase Hostingへのデプロイ
3. **Health Check**: デプロイ後の動作確認
4. **Notification**: デプロイ結果の通知

### 3. Dependencies Check (.github/workflows/dependencies.yml)

#### 目的
- 依存関係のセキュリティチェック
- 自動セキュリティ修正
- ライセンス適合性チェック

#### 実行タイミング
- 毎週月曜日 9:00 UTC
- 手動実行

## Firebase設定

### 必要なファイル

```
kibarashi-app/
├── firebase.json      # Firebase Hosting設定
├── .firebaserc       # プロジェクト設定
└── .github/
    └── workflows/    # GitHub Actions設定
```

### firebase.json の主要設定

```json
{
  "hosting": {
    "public": "frontend/dist",
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }],
    "headers": [
      // セキュリティヘッダー設定
    ]
  }
}
```

## GitHub Secrets設定

### 必須のシークレット

GitHubリポジトリのSettings > Secrets and variables > Actionsで以下を設定：

#### Firebase関連
- `FIREBASE_PROJECT_ID`: FirebaseプロジェクトID
- `FIREBASE_TOKEN`: Firebase CLIトークン
- `FIREBASE_SERVICE_ACCOUNT`: サービスアカウントキー（JSON形式）

#### アプリケーション設定
- `VITE_API_URL`: 本番環境のAPIエンドポイント
- `VITE_GEMINI_API_KEY`: Gemini APIキー

### Firebase CLIトークンの取得

```bash
# Firebase CLIをインストール
npm install -g firebase-tools

# ログイン
firebase login

# CIトークンを生成
firebase login:ci
```

### サービスアカウントキーの作成

1. Firebase Console > プロジェクト設定 > サービスアカウント
2. 「新しい秘密鍵の生成」をクリック
3. ダウンロードしたJSONファイルの内容をGitHub Secretsに設定

## 環境構築手順

### 1. Firebaseプロジェクトの作成

```bash
# Firebase CLIでプロジェクト初期化
firebase init hosting

# プロジェクトを選択し、以下のように設定：
# - Public directory: frontend/dist
# - Single-page app: Yes
# - Set up automatic builds: No（GitHub Actionsを使用するため）
```

### 2. .firebasercの更新

```json
{
  "projects": {
    "default": "your-actual-firebase-project-id",
    "production": "your-production-project-id",
    "staging": "your-staging-project-id"
  }
}
```

### 3. GitHub Secretsの設定

上記「GitHub Secrets設定」セクションを参照

### 4. ワークフローの動作確認

```bash
# mainブランチにpushしてワークフローをトリガー
git add .
git commit -m "feat: CI/CD設定完了"
git push origin main
```

## トラブルシューティング

### よくある問題

#### 1. Firebase認証エラー
```
Error: Authentication Error: Your credentials are no longer valid.
```

**解決方法:**
- `FIREBASE_TOKEN` シークレットを再生成
- サービスアカウントキーの権限を確認

#### 2. ビルドエラー
```
Error: Could not resolve "./some-module"
```

**解決方法:**
- `npm ci` でクリーンインストール
- パッケージ間の依存関係を確認

#### 3. テスト失敗
```
Tests failed in CI but pass locally
```

**解決方法:**
- CI環境とローカル環境のNode.jsバージョンを統一
- タイムゾーンやロケール設定の違いを確認

### デバッグ方法

#### GitHub Actions ログの確認
1. GitHub > Actions タブ
2. 失敗したワークフローを選択
3. 各ジョブのログを詳細確認

#### ローカルでのFirebase エミュレーター
```bash
# エミュレーター起動
firebase emulators:start

# ブラウザでhttp://localhost:5000にアクセス
```

## セキュリティ考慮事項

### 1. Secrets管理
- APIキーやトークンは絶対にコードにハードコーディングしない
- GitHub Secretsを使用してセンシティブな情報を管理
- 定期的にトークンをローテーション

### 2. 権限管理
- サービスアカウントは最小権限の原則に従う
- デプロイ専用のサービスアカウントを作成
- 本番環境と開発環境でアカウントを分離

### 3. セキュリティスキャン
- Trivyによる脆弱性スキャンを毎回実行
- 依存関係の自動アップデート
- ライセンス適合性チェック

## 監視とメトリクス

### 1. デプロイメトリクス
- デプロイ頻度
- デプロイ成功率
- 平均デプロイ時間

### 2. 品質メトリクス
- テストカバレッジ
- ビルド成功率
- セキュリティ脆弱性数

### 3. アラート設定
- デプロイ失敗時の通知
- セキュリティ脆弱性検出時の通知
- テスト失敗時の通知

## ベストプラクティス

### 1. ブランチ戦略
- `main`: 本番環境への自動デプロイ
- `develop`: 開発環境への自動デプロイ（将来実装）
- `feature/*`: プルリクエスト時のCI実行

### 2. コミットメッセージ
- Conventional Commitsに従う
- 自動的なCHANGELOG生成（将来実装）

### 3. テスト戦略
- ユニットテスト: 高速実行、高カバレッジ
- 統合テスト: 主要フローの検証
- E2Eテスト: ユーザー体験の検証（将来実装）

## 拡張計画

### Phase 1（現在）
- ✅ 基本的なCI/CD
- ✅ Firebase Hosting デプロイ
- ✅ セキュリティスキャン

### Phase 2（計画中）
- [ ] E2Eテストの追加
- [ ] パフォーマンステスト
- [ ] ステージング環境の構築

### Phase 3（将来）
- [ ] Blue-Greenデプロイメント
- [ ] カナリアリリース
- [ ] 自動ロールバック

---

**最終更新**: 2025/06/15  
**作成者**: Claude Code  
**次回レビュー**: Firebase設定完了後