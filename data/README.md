# data/

提案候補ファイル用のディレクトリ。

- `data/analysis/`  — カバレッジ分析の出力（`suggestion-coverage.json`）
- `data/pending/`   — AIバッチ生成された提案候補（レビュー待ち）
- `data/approved/`  — レビュー済みで DB 投入予定のファイル
- `data/approved/committed/` — `promote-suggestions.js` で投入済み

運用手順は `scripts/README-suggestions.md` 参照。
