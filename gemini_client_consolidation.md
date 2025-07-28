# geminiClient.ts の重複統合に関する相談

## 現状
プロジェクトに2つのgeminiClient.tsが存在しています：
1. `/backend/src/services/gemini/geminiClient.ts`
2. `/packages/core-logic/src/services/gemini/geminiClient.ts`

## 主な違い

### 初期化タイミング
- **backend版**: コンストラクタで即座に初期化 (`this.initializeClient()`)
- **packages版**: 遅延初期化（実際に使用される時まで初期化を遅らせる）

### その他の違い
- `isInitialized`フラグの有無（packages版にのみ存在）
- packages版の方が新しい実装のように見える

## 質問
1. どちらのバージョンを残すべきでしょうか？
2. 統合時の考慮事項は何かありますか？
3. モノレポ構造でのコード共有のベストプラクティスは？

## 推奨アプローチ
- packages/core-logic版を共通コードとして使用
- backend側はpackages/core-logicからインポート
- 遅延初期化の実装を維持（パフォーマンス向上のため）