# プロジェクト全体のBugbotルール

## プロジェクト概要

- 言語: TypeScript 5.x（strict mode）
- フロントエンド: React 18 + Vite + Tailwind CSS
- バックエンド: Express.js
- テスト: Vitest, Playwright
- 開発フロー: Canon TDD（テスト先行）+ Living Spec（Kiro Spec継続同期）

## 重点チェック

### ロジックバグ（P0）
- null/undefined参照
- 境界値エラー（off-by-one）
- エッジケース（空配列、空文字列、ゼロ除算）
- 型の不一致（any型の使用）
- 無限ループ・無限再レンダリング

### セキュリティ（P0）
- インジェクション（SQL、コマンド、パス）
- XSS脆弱性
- 認証・認可の欠陥
- 機密情報のハードコード（APIキー、パスワード）
- パストラバーサル

### React固有（P1）
- hooks の依存配列の誤り
- useEffect のクリーンアップ漏れ
- メモリリーク（イベントリスナー未解除）
- 不要な再レンダリング

### エラーハンドリング（P1）
- 例外の握りつぶし
- 不適切なエラーメッセージ
- リソースリーク（接続、ファイルハンドル）

## 無視してよい項目

- コードスタイル（ESLint/Prettierで対応）
- import順序
- 変数名の好み（一貫性があれば可）

## プロジェクト固有ルール

### テスト
- テストファイルの変更は要注意フラグ（Canon TDD違反の可能性）
- 実装PRでテストを変更していたらP0として報告

### 構造
- フロントエンド: frontend/src/ 配下
- バックエンド: backend/src/ 配下
- 共有: packages/core-logic/ 配下
