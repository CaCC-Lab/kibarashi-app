# AGENTS.md

## Overview

このリポジトリは Canon TDD（テスト先行）+ AI開発フロー v7.8.5b で開発しています。
テストは Cursor が作成し、実装は Claude Code が担当します。
Kiro Spec は Living Spec として継続的に同期します。

## 技術スタック

- TypeScript 5.x（strict mode）
- React 18 + Vite（フロントエンド）
- Express.js（バックエンド）
- Vitest（ユニット/統合テスト）
- Playwright（E2Eテスト）
- Tailwind CSS（スタイリング）

## MCP運用ポリシー

### Phase 0.5
- Context7 で主要依存の事実確認を行う
- breaking change / 非推奨 / 実装前提の差分を記録する

### Phase 4.6
- 原則は Playwright MCP で主要UIまたは実行フローを確認する
- DOM外UI / ネイティブUI / OSダイアログなど、Playwright で扱えない場合のみ Computer Use を使う
- 実行確認で仕様差分が見つかった場合は Phase 1 に戻る

### Bugfix Step 0
- Current Behavior は証拠に基づいて書く
- Sentry / Playwright / ローカルログなどを証拠ソースとして扱う
- 原因仮説と観測事実を分離する

## Review guidelines

### 要件トレーサビリティ（P0）
- .kiro/specs/*/requirements.md の各要件（REQ-xxx）に対応する実装があるか確認
- 未実装の要件があればP0として報告
- 要件IDを明示して報告すること

### 仕様ズレ（P0）
- 実装が requirements.md の記述と矛盾していればP0として報告
- Acceptance Criteria（EARS形式）との整合性を確認

### Spec同期（P0）
- requirements/design/tasks の同期状態を確認
- requirements が更新されているのに design/tasks が古い場合はP0として報告

### Canon TDD制約（P0）
- 実装PRでテストファイルを変更していたらP0として報告
- 理由: テストはCursorの責務、実装はClaude Codeの責務

### 型安全性（P1）
- any型の使用はP1として報告
- unknown + 型ガードへの変換を推奨

### エッジケース（P1）
- 空配列、空文字列、null/undefined、ゼロ除算の考慮漏れ
- 境界値（off-by-one）エラー

### ロギング（P2）
- console.log の使用はP2として報告
- 構造化ロギングの使用を推奨

## Coding guidelines

- TypeScript strict mode
- ESLint + Prettier 準拠
- any型禁止（unknown + 型ガードを使う）
- console.log 禁止（開発時のデバッグ以外）

## Project structure

```
frontend/src/     # React フロントエンド
backend/src/      # Express バックエンド
packages/         # 共有パッケージ
api/              # Vercel サーバーレス関数
tests/            # E2E・統合テスト
.kiro/specs/      # 仕様書
.kiro/steering/   # 基盤Steering
```
