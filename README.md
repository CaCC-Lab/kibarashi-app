# 🧘 5分気晴らし - AIによる音声ガイド付きストレス解消アプリ

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀%20デモサイト-今すぐ体験-brightgreen?style=for-the-badge)](https://kibarashi-app.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**AIによる音声ガイド付きストレス解消提案アプリ**
職場の人間関係でストレスを抱える20-40代のための、シンプルで使いやすい気晴らし提案サービス

</div>

---

## 🎯 デモサイト

<div align="center">
  <a href="https://kibarashi-app.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🌐%20アプリを体験する-kibarashi--app.vercel.app-blue?style=for-the-badge" alt="デモサイト">
  </a>
</div>

---

## 🌟 概要

職場でのストレスを抱える方々のために開発した、AIによる気晴らし提案アプリケーションです。Google Gemini AIを活用し、ユーザーの状況に応じた最適なリラックス方法を提案。登録不要・完全無料で、必要な時にすぐ使えるPWAとして設計されています。

### 💡 解決する課題

- **ターゲットユーザー**: 職場の人間関係でストレスを抱え、休日をゲーム・YouTube・惰眠で過ごしてしまう20-40代
- **既存アプリの問題点**: 課金ストレス、継続困難、機能過多による挫折
- **本アプリの価値**: その場で使える、シンプルな気晴らし方法の即座の提案

---

## ✨ 主な機能

### 🤖 AI駆動の提案システム

- **Gemini 2.5 Flash Preview** による動的でコンテキストに応じた提案生成
- 場所（職場・家・外出）と時間（5分・15分・30分）に基づくパーソナライズ
- 認知的・行動的カテゴリーに分類された多様な提案

### 🎙️ 高度な音声ガイド機能

- **Gemini TTS** による高品質な日本語音声合成
- ブラウザTTSへの自動フォールバック機能
- タイマーと連動した音声ガイド付きリラクゼーション

### 📱 プログレッシブウェブアプリ（PWA）

- どのデバイスでもネイティブアプリのようにインストール可能
- **オフライン対応** - インターネット接続なしでも基本機能が動作
- ホーム画面への追加機能

### 🎨 モダンなUI/UX

- **ダークモード** （システム設定連動・手動切り替え可能）
- **WCAG AA準拠** のアクセシビリティ
- 全デバイスに最適化されたレスポンシブデザイン
- スムーズなアニメーションとマイクロインタラクション

### 🧪 技術的な優位性

- **95.5%のテストカバレッジ** （モック完全排除方針）
- **サーバーレスアーキテクチャ** （Vercel Functions）
- **TypeScript** による完全な型安全性
- **パフォーマンス最適化** （コード分割実装）

### 📊 実装済み機能一覧

#### Phase 1 & 2 完了

- ✅ AI提案生成（Gemini API）
- ✅ 音声ガイド（Gemini TTS + ブラウザTTS）
- ✅ タイマー機能（開始・一時停止・リセット）
- ✅ お気に入り機能（保存・エクスポート）
- ✅ 履歴管理（統計・評価・メモ機能付き）
- ✅ カスタム気晴らし（ユーザー独自の提案登録）
- ✅ 統合データ管理（全データの一括エクスポート/インポート）
- ✅ ダークモード対応
- ✅ PWA機能（オフライン対応）

#### Phase 3 完了

- ✅ Vercel Functions移行（サーバーレス化）
- ✅ CI/CD パイプライン構築
- ✅ セキュリティスキャン自動化

---

## 🛠️ 技術スタック

<div align="center">

| フロントエンド |   バックエンド   |    AI・音声    |    インフラ    |
| :------------: | :--------------: | :------------: | :------------: |
|    React 18    | Vercel Functions |   Gemini AI    |     Vercel     |
|   TypeScript   |     Node.js      |   Gemini TTS   | GitHub Actions |
|  Tailwind CSS  |    Express.js    | Web Speech API |     Docker     |
|      Vite      |    PostgreSQL    |                |      GCP       |
|      PWA       |      Redis       |                |                |

</div>

### 📊 パフォーマンス指標

```
┌─────────────────────────────────────┐
│ 🚀 バンドルサイズ                    │
├─────────────────────────────────────┤
│ Vendor:  139.45 KB                  │
│ Main:     14.79 KB                  │
│ 合計:    ~154 KB (gzip圧縮後)       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✅ テストカバレッジ                  │
├─────────────────────────────────────┤
│ 総テスト数: 425                      │
│ 成功: 419 (98.6%)                   │
│ カバレッジ: 95.5%                   │
│ モック使用: 0%                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🌐 Lighthouse スコア                │
├─────────────────────────────────────┤
│ パフォーマンス:     95+             │
│ アクセシビリティ:   100             │
│ ベストプラクティス: 100             │
│ SEO:              100               │
│ PWA:              ✓                 │
└─────────────────────────────────────┘
```

---

## 📸 スクリーンショット

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="docs/images/light-mode-home.png" alt="ライトモード ホーム画面" width="300">
        <br>
        <em>ライトモード - ホーム画面</em>
      </td>
      <td align="center">
        <img src="docs/images/dark-mode-suggestions.png" alt="ダークモード 提案画面" width="300">
        <br>
        <em>ダークモード - AI提案画面</em>
      </td>
      <td align="center">
        <img src="docs/images/mobile-pwa.png" alt="モバイルPWA" width="300">
        <br>
        <em>モバイルPWA体験</em>
      </td>
    </tr>
  </table>
</div>

---

## 🎯 技術的な挑戦と解決策

### 1. ゼロモックテスト哲学

**課題**: モックを一切使用せずにテストの信頼性を確保
**解決策**:

- トランザクションロールバック付きの実際のテストデータベースを実装
- 各テストスイート用の分離されたテスト環境を作成
- 実際の統合のみで95.5%のカバレッジを達成

### 2. サーバーレス環境でのGemini TTS統合

**課題**: Vercel FunctionsでGemini 2.5 Flash Preview TTSを統合
**解決策**:

- ffmpegなしでPCM音声データをWAVフォーマットに変換
- カスタムWAVヘッダー生成を実装
- ブラウザTTSへのフォールバック機構を作成

### 3. オフラインPWA機能

**課題**: 意味のあるオフライン体験の提供
**解決策**:

- インテリジェントなService Workerキャッシュ戦略を実装
- 必須の提案データを事前キャッシュ
- 同期機能付きのオフラインファーストアーキテクチャを作成

### 4. 大規模なアクセシビリティ対応

**課題**: 全機能でWCAG AA準拠を確保
**解決策**:

- CI/CDでの自動アクセシビリティテスト
- 適切なコントラスト比を持つカスタムTailwindカラーパレット
- 包括的なARIAラベリングとキーボードナビゲーション

### 5. 気晴らし提案の多様性確保

**課題**: 同じ提案が繰り返し表示される問題
**解決策**:

- Fisher-Yatesアルゴリズムによる真のランダムシャッフル実装
- フォールバックデータを20個から30個に拡充（特に30分枠を強化）
- Gemini APIプロンプトに時間ベースシードと多様性指示を追加
- 完全に一意なID生成システムの実装

### 6. 開発環境のポート競合と実行エラー

**課題**: ポート8080の競合とTypeScript実行エラー
**解決策**:

- バックエンドポートを8081に変更（docker-nginxとの競合回避）
- TypeScript実行をts-nodeからtsxに切り替え（ESMローダーエラーの解決）
- Gemini APIレスポンスパーサーの修正（Markdownコードブロック対応）
- フロントエンドAPIクライアントのレスポンス形式修正

### 7. 音声生成のレスポンス形式エラー

**課題**: MP3音声データをJSONとしてパースしようとしてエラー発生
**解決策**:

- TTSサービスでresponseType: 'blob'を指定してバイナリデータを直接受信
- 不要なJSONラッピングとBase64デコード処理を削除
- バックエンドの音声レスポンスとフロントエンドの期待形式を統一

### 8. Vercelデプロイ環境での提案表示エラー

**課題**: ローカルでは動作するがVercel環境で提案が表示されない
**解決策**:

- Vercel Functionsのレスポンス形式をローカルバックエンドと統一
- 不要な`success`フィールドを削除し、データを直接返すように修正
- suggestions、tts、healthの全エンドポイントでレスポンス形式を統一

### 9. Vercel本番環境でのTailwind CSSエラー

**課題**: SuggestionDetailコンポーネントで`Cannot read properties of undefined (reading 'bg')`エラー
**解決策**:

- テンプレートリテラル内での動的クラス名生成を修正
- 条件分岐を完全なクラス名文字列に変更
- Tailwind設定にsafelistを追加して動的クラスの削除を防止

### 10. Tailwind CSSエラーの再発（SuggestionCardコンポーネント）

**課題**: SuggestionCardで`Cannot read properties of undefined (reading 'bg')`エラーが再発
**解決策**:

- categoryStylesオブジェクトのプロパティアクセスにオプショナルチェイニング（`?.`）を追加
- フォールバック値として`categoryStyles['認知的']`を設定して想定外のcategory値に対応
- ダークモードクラスを各プロパティに統合（darkBg, darkBorderプロパティを削除）

### 11. Gemini APIキャッシュ問題の修正

**課題**: 「他の提案を見る」ボタンをクリックしても同じ提案が表示される
**解決策**:

- CORSエラーの修正: バックエンドのallowedHeadersに`Cache-Control`と`Pragma`を追加
- キャッシュ無効化ヘッダーの追加: フロントエンドとバックエンドの両方で設定
- URLキャッシュバスター: タイムスタンプパラメータ`_t`を追加
- fetchオプションに`cache: 'no-store'`を設定
- 詳細なドキュメントとテストコードを作成

---

## 🚀 学んだこと

1. **サーバーレスアーキテクチャ**: Express.jsからVercel Functionsへの移行により、コールドスタートの最適化とステートレスサービスの管理について学習
2. **AI統合**: Gemini APIとの連携により、プロンプトエンジニアリングとフォールバック戦略の重要性を理解
3. **テスト哲学**: ゼロモックアプローチにより、統合テストとテスト環境管理への理解が深化
4. **アクセシビリティ**: WCAG AA準拠の実装により、インクルーシブデザインの原則に関する知識が向上
5. **パフォーマンス**: 200KB未満のバンドルサイズ達成には、依存関係の慎重な分析とコード分割戦略が必要

---

## 🔧 セットアップ & インストール

### 前提条件

- Node.js 20.x 以上
- npm または yarn
- Gemini API キー

### クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/CaCC-Lab/kibarashi-app.git
cd kibarashi-app

# 依存関係のインストール
npm run setup

# 環境変数の設定
cp frontend/.env.example frontend/.env
# .envファイルを編集してGEMINI_API_KEYを追加

# 開発サーバーの起動
vercel dev
# http://localhost:3000 にアクセス
```

### Vercel環境のデバッグ

```bash
# デバッグエンドポイントで環境変数の状態を確認
curl https://your-app.vercel.app/api/v1/debug?debug=true

# Vercel CLIでログを確認
vercel logs --follow

# 環境変数の設定（Vercel Dashboard経由を推奨）
vercel env add GEMINI_API_KEY
```

### テストの実行

```bash
# 全テストを実行
npm test

# カバレッジ付きで実行
npm run test:coverage

# 特定のテストスイートを実行
npm test -- --grep "TTS"
```

---

## 📁 プロジェクト構造

```
kibarashi-app/
├── frontend/          # Reactフロントエンド
├── backend/           # 従来のExpress.jsバックエンド（保持）
├── api/              # Vercel Functions（新）
│   └── v1/           # APIエンドポイント
│       ├── suggestions.ts    # 気晴らし提案API
│       ├── tts.ts           # 音声合成API
│       └── health.ts        # ヘルスチェックAPI
├── infrastructure/    # インフラ設定
├── docs/             # ドキュメント
├── vercel.json       # Vercel設定
└── CLAUDE.md         # Claude Code用ガイド
```

詳細は [directorystructure.md](./directorystructure.md) を参照してください。

---

## 🚀 次期展開：革新的ウェルネスプラットフォーム（Phase 4）

### 世界初の職場統合型マイクロウェルネス体験

Phase 4では、現在の基本機能を基盤として**日本の職場ストレス問題を根本的に解決する革新的ウェルネスプラットフォーム**への進化を計画しています。

#### 🔮 革新的機能群（6つのコア機能）

**1. ストレス予報士AI**
- 天気予報のように個人のストレスを予測・予防
- TensorFlow.js + 時系列分析による高度な予測システム

**2. 感情錬金術ラボ**
- ネガティブ感情を創造的エネルギーに変換
- React DnD + Canvas APIによるインタラクティブ体験

**3. ソーシャル無言サポート**
- 日本の「察する文化」をデジタル化した支援ネットワーク
- WebSocketによる匿名リアルタイム支援システム

**4. 禅UI（無のインターフェース）**
- 画面を見ずに操作可能な革新的ユーザーインターフェース
- Web Audio API + ジェスチャー認識による新体験

**5. デジタル守護霊（おまもりAI）**
- 日本の「お守り」文化をAI化した精神的サポート
- パーソナライゼーションAI × 文化的コンテンツDB

**6. マイクロ予言システム**
- 5分後の自分への小さな予言による自己成就予言効果
- 行動予測AI + 心理学的フレーミング

#### 📅 実装計画
- **期間**: 7週間の集中開発スプリント
- **チーム**: 4-6名の専門開発チーム
- **投資**: ¥10,273,000-13,813,000
- **目標**: 事後対処から予防への革命的転換

#### 🎯 期待される革新的効果
- **ストレス軽減指数**: 基準値から30%改善
- **予防的介入成功率**: 70%以上
- **企業導入**: 100社以上（1年以内）
- **真のデジタルウェルビーイング**: スマホ依存を増やさない設計

詳細は以下の企画書をご参照ください：
- [革新的統合提案書_最終版.md](革新的統合提案書_最終版.md)
- [完全実装開発計画書.md](完全実装開発計画書.md)

---

## 📈 従来機能の今後の展望

- [ ] 多言語対応（英語、中国語、韓国語）
- [ ] Apple Watch / Wear OS コンパニオンアプリ
- [ ] 人気瞑想アプリとの統合
- [ ] 高度な分析ダッシュボード
- [ ] コミュニティ提供のリラクゼーション技術

---

## 🤝 コントリビューション

これは個人のポートフォリオプロジェクトですが、フィードバックや提案は歓迎します！お気軽に：

- バグや機能リクエストのIssueを開く
- 改善のためのPRを提出
- 役立つと思ったらリポジトリにスターを付ける

---

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)を参照してください。

---

## 👨‍💻 開発者について

**開発者**: CaCC-Lab
**問い合わせ先**: https://cacc-lab.net/otoiawase/
