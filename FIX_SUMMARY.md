# 提案表示問題の修正

## 問題の内容
本番環境でAPIエラーはなくなったが、提案が画面に表示されない問題が発生。

## 原因
APIレスポンスの構造とフロントエンドが期待する構造が不一致。

### 修正前のAPI構造
```json
{
  "status": "success",
  "data": {
    "suggestions": [...],
    "metadata": {...}
  }
}
```

### フロントエンドが期待する構造
```json
{
  "suggestions": [...],
  "metadata": {...}
}
```

フロントエンドコード（useSuggestions.ts）では `data.suggestions` を直接アクセスしているため、提案データが取得できていなかった。

## 実施した修正

1. **suggestions.js の修正**
   - レスポンス構造から `status` と `data` のラッパーを削除
   - `suggestions` と `metadata` を直接トップレベルに配置
   - エラーレスポンスも統一的な構造に変更

2. **context.js の修正**
   - エラーレスポンスの構造を統一

3. **test-api.js の改善**
   - suggestions配列が正しい位置にあることを検証する機能を追加

## 修正により期待される効果
- フロントエンドが提案データを正しく取得できるようになる
- 画面に提案が表示されるようになる
- APIレスポンスの構造が一貫性を持つ

## 今後の推奨事項
1. APIレスポンスの型定義をTypeScriptで厳密に管理
2. APIとフロントエンド間の契約をOpenAPI/Swaggerで文書化
3. 統合テストの追加で同様の問題を防ぐ