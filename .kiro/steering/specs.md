---
inclusion: always
---

# Kiro Spec / Steering 運用ルール

## 目的
Kiro を「Spec生成ツール」ではなく「Living Spec の維持・同期ツール」として使う。

## Steering の原則

### 基盤Steering（常時読み込み）
以下を `.kiro/steering/` に配置する。

- product.md
- tech.md
- structure.md

### 追加Steering（既存・継続使用）
- test-strategy.md
- commit-message-format.md
- pr-message-format.md
- proactive-subagents-and-skills.md
- v5.md

## Bugfix Spec の原則

Kiro公式の Bugfix Spec は Feature Spec とは別のワークフロー。`bugfix.md`（requirements.md ではない）を生成し、リグレッション防止を明示的に扱う。

**トリガー：** マージ済み・リリース済みコードにバグが発見されたとき

### bugfix.md の3セクション構成

```markdown
# Bugfix: {バグ名}

## Current Behavior（現在の動作）
{バグの具体的な症状・再現手順}

## Expected Behavior（期待する動作）
{修正後に期待される正しい動作}

## Unchanged Behavior（変更しない動作）
{リグレッション防止：修正に伴い変えてはいけない既存動作の列挙}
```

### 禁止

- Feature Spec 例外手順でマージ済みバグを処理すること
- Unchanged Behavior に列挙された動作をカバーするテストを変更すること

## Feature Spec の原則

### 初回生成

Kiro により以下を生成する。

- requirements.md
- design.md
- tasks.md

**ワークフロー選択（MUST・変更不可）：**

|ワークフロー|適用場面|同期チェーン方向|
|---|---|---|
|**Requirements-First**（標準・推奨）|Canon TDD標準。要件が先行して決まっている場合|requirements → design Refine → tasks Update|
|**Design-First**|技術設計が先行している場合（既存システム移植等）|design → requirements 逆導出 → tasks Update|

> 一度選択したワークフローは変更不可。変更が必要な場合は新しい Feature Spec を作成する。

### 継続更新（MUST）

仕様変更・要件追加・設計差分が発生した場合は以下の順に同期する。

1. requirements.md を更新
2. design.md を Refine
3. tasks.md を Update tasks
4. 必要なら「Check which tasks are already complete」で再判定

### 禁止

- requirements.md だけ更新して design/tasks を放置すること
- 実装コードを正として requirements を暗黙更新すること
- tasks.md が古いまま Cursor / Claude Code に作業を渡すこと

## Canon TDD との接続

### Task順序

1. requirements.md
2. design.md
3. tasks.md
4. Cursor で tests 作成
5. Claude Code / Cloud Agent で実装

### 例外時

Spec の誤り・要件変更・テストバグ時は、必ず Spec 同期を先に行う。

## requirements.md のルール

- EARS 形式を基本とする
- 各要件に REQ-xxx のIDを付与する
- Acceptance Criteria を明示する
- 曖昧な主語を避ける
- 変更時は差分理由をコミットメッセージで残す

## design.md のルール

- requirements.md に追従する
- Refine を使って差分同期する
- 実装詳細ではなく設計判断・境界・責務分離を明示する
- エラーハンドリング、制約、非機能要件を落とさない

## tasks.md のルール

- tasks は requirements / design にトレースできること
- テスト作成タスクと実装タスクを分離する
- Update tasks を定期実施する
- 完了済みタスクの再判定を正式手順として認める

## コミット規約

- `spec(req): {理由}`
- `spec(design): {理由}`
- `spec(tasks): {理由}`
- `fix(test): {理由}`
- `fix(bugfix): {バグ名}` - Bugfix Spec 使用時
- `test(bugfix): {バグ名}` - Bugfix Spec の再現テスト
- `feat: {機能名}`
- `refactor: {内容}`

## Spec Sync Gate（MUST）

> ⚠️ Kiro の組み込み機能ではなく、本フローの運用ルール。

Phase 3 以降に進む前に以下を満たすこと。

- requirements.md が最新
- design.md が Refine 済み
- tasks.md が Update tasks 済み
- 必要時に完了タスク再判定済み
