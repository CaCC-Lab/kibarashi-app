# Geminiからの追加タスク提案 (2025/06/27)

このドキュメントは、AIアシスタントGeminiがプロジェクト全体を分析し、今後の更なる発展のために提案するタスクリストです。
`TODO.md`の内容を補完し、特に本番リリース後から中長期的な視点での改善項目を網羅することを目的としています。

---

## 🚀 Phase 3: 本番リリース後の安定化と監視 (Post-Launch)

本番デプロイが完了した直後に着手すべきタスクです。ユーザーに安定したサービスを提供し、問題発生時に迅速に対応できる体制を整えます。

- [ ] **本番環境モニタリング設定**
    - [ ] **リアルタイムエラー監視:** SentryやVercel連携可能なエラー監視ツールを導入し、フロントエンド・バックエンドで発生したエラーを即時検知・通知する仕組みを構築する。
    - [ ] **パフォーマンス監視:** Vercel Analyticsを有効化し、Web Vitals（LCP, FID, CLS）のスコアを定常的に監視。パフォーマンス低下の兆候を早期に発見する。
    - [ ] **ログ収集・分析:** Vercel Functionsのログを永続化・検索可能にする（Logflare, Datadogなど）。特にAPIエラーや予期せぬ挙動の追跡に利用する。

- [ ] **ユーザーフィードバック収集の仕組み作り**
    - [ ] アプリ内にシンプルなフィードバックフォームを設置する（Googleフォームへのリンクなど）。
    - [ ] 「改善要望」や「バグ報告」を送信できる導線を設定画面などに追加する。

- [ ] **セキュリティヘッダーの強化**
    - [ ] `vercel.json`にて、`Content-Security-Policy` (CSP) をより厳格に設定する（`script-src`, `style-src`など）。
    - [ ] `Permissions-Policy` を追加し、不要なブラウザ機能（マイク、カメラ等）へのアクセスを明示的に無効化する。

## 💖 Phase 4: ユーザー中心の機能改善サイクル

収集したフィードバックや利用状況データを元に、ユーザー体験をさらに向上させるための機能改善サイクルを定義します。

- [ ] **オンボーディング体験の向上**
    - [ ] 初回アクセス時にアプリの主要な使い方を説明する簡単なチュートリアル（またはガイドツアー）を実装する。
    - [ ] 各機能の初回利用時に、機能説明のツールチップを表示する。

- [ ] **パーソナライゼーション機能の深化**
    - [ ] 履歴データに基づき、「あなたへのおすすめ」や「最近よく使う気晴らし」をトップページに表示するロジックを検討・実装する。
    - [ ] ユーザーが苦手な（あるいは低評価をつけた）気晴らしのカテゴリを、提案から除外する設定を追加する。

- [ ] **アクセシビリティ(a11y)の監査と改善**
    - [ ] axe DevToolsなどのツールを用いて、リリースされたアプリのアクセシビリティを網羅的に監査する。
    - [ ] スクリーンリーダーでの読み上げ順序やARIA属性の最適化を行う。
    - [ ] OSのハイコントラストモードや文字サイズ変更設定に対応する。

- [ ] **国際化(i18n)・多言語対応の基盤構築**
    - [ ] `i18next` などのライブラリを導入し、UI上のテキストを言語ファイルに分離するリファクタリングを行う。
    - [ ] まずは英語対応を目標とし、言語切り替え機能を設定画面に追加する。

## 🛠️ Phase 5: 技術的負債の返済とスケーラビリティ向上

プロジェクトが長期的に健全な状態を保つための技術的な改善タスクです。

- [ ] **コンポーネントとロジックのリファクタリング**
    - [ ] 肥大化したコンポーネント（`SuggestionDetail`など）を、より小さな責務を持つコンポーネントに分割する。
    - [ ] 複数のコンポーネントで利用されているロジックをカスタムフックとして抽出し、再利用性を高める（例: `useLocalStorage`）。
    - [ ] `any`型が残存している箇所を特定し、より厳密な型定義に修正する。

- [ ] **テスト戦略の高度化**
    - [ ] **E2E（エンドツーエンド）テスト:** PlaywrightやCypressを導入し、「状況を選択してから音声が再生されるまで」といった主要なユーザーフローを自動テストする。
    - [ ] **ビジュアルリグレッションテスト:** Chromaticなどを導入し、UIコンポーネントの意図しない見た目の変化をCIで検知する。

- [ ] **状態管理ライブラリの導入検討**
    - [ ] アプリケーションの状態が複雑化した場合に備え、`Zustand`や`Jotai`などの軽量な状態管理ライブラリの導入を検討・検証する。
    - [ ] `props`のバケツリレーが多層になっている箇所を特定し、リファクタリングの候補とする。

- [ ] **CI/CDパイプラインの最適化**
    - [ ] ビルド時間の短縮（Vercelのビルドキャッシュ活用など）。
    - [ ] `package.json`の'scripts'を整理し、`npm run lint:fix`や`npm run format`などをCIに組み込む。
    - [ ]依存関係の脆弱性を定期的にスキャンする仕組みを導入する（`npm audit`のCI統合など）。

## 📚 プロジェクト管理とドキュメント

- [ ] **コントリビューションガイドラインの作成 (`CONTRIBUTING.md`)**
    - [ ] 新しい開発者が参加する際の手順（環境構築、ブランチ戦略、PRの作法）を明記する。
- [ ] **コンポーネントカタログの整備**
    - [ ] StorybookやLadleを導入し、UIコンポーネントを一覧化・ドキュメント化する。これにより、コンポーネントの再利用性が向上し、UIの一貫性が保たれる。
- [ ] **依存パッケージの定期的な棚卸し**
    - [ ] 四半期に一度など、使用しているnpmパッケージを見直し、不要なものを削除したり、よりモダンな代替ライブラリへの移行を検討する。