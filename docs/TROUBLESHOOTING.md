# トラブルシューティングガイド

## 概要
このドキュメントは、5分気晴らしアプリケーションで発生する可能性のある問題と解決方法をまとめたものです。

## 目次
1. [API関連の問題](#api関連の問題)
2. [フロントエンドの問題](#フロントエンドの問題)
3. [デプロイメントの問題](#デプロイメントの問題)
4. [パフォーマンスの問題](#パフォーマンスの問題)
5. [開発環境の問題](#開発環境の問題)

---

## API関連の問題

### 問題: 提案が画面に表示されない（APIエラーなし）

**症状**
- APIは200 OKを返すが、フロントエンドに提案が表示されない
- コンソールエラーはない

**原因**
APIレスポンスの構造がフロントエンドの期待と異なる

**解決方法**
1. test-api.jsでAPIレスポンス構造を確認
   ```bash
   node test-api.js
   ```

2. フロントエンド（useSuggestions.ts）が期待する構造を確認
   ```typescript
   // 期待される構造
   {
     suggestions: [...],
     metadata: {...}
   }
   ```

3. APIレスポンスを修正（api/v1/suggestions.js）
   ```javascript
   // ❌ 間違った構造
   return res.json({
     status: 'success',
     data: { suggestions: [...] }
   });

   // ✅ 正しい構造
   return res.json({
     suggestions: [...],
     metadata: {...}
   });
   ```

### 問題: Context API 404エラー

**症状**
- `/api/v1/context`へのリクエストが404を返す

**原因**
- context.jsファイルが存在しない
- Vercelへのデプロイが完了していない

**解決方法**
1. api/v1/context.jsファイルを作成
2. GitHubにプッシュ
3. Vercelのデプロイ完了を待つ（2-3分）

### 問題: CORS エラー

**症状**
- ブラウザコンソールに"CORS policy"エラーが表示される

**解決方法**
すべてのAPIエンドポイントに以下のヘッダーを追加：
```javascript
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

if (req.method === "OPTIONS") {
  return res.status(200).end();
}
```

### 問題: Gemini APIの料金制限

**症状**
- 429 Too Many Requestsエラー
- "RATE_LIMIT_EXCEEDED"エラー

**解決方法**
1. 静的な提案データにフォールバック
2. レート制限の確認と調整
3. APIキーのローテーション実装（複数キー対応）

---

## フロントエンドの問題

### 問題: 白い画面（何も表示されない）

**症状**
- ページが真っ白
- コンソールにJavaScriptエラー

**解決方法**
1. ブラウザの開発者ツールでエラーを確認
2. よくある原因：
   - import文のパスエラー
   - 環境変数の未設定
   - TypeScriptの型エラー

### 問題: 状態管理の不整合

**症状**
- 選択した状況や時間が反映されない
- 提案が更新されない

**解決方法**
1. React Developer Toolsで状態を確認
2. useEffectの依存配列を確認
3. APIコールのタイミングを確認

### 問題: PWAがインストールできない

**症状**
- インストールボタンが表示されない
- "Add to Home Screen"が機能しない

**原因と解決方法**
1. HTTPSでアクセスしているか確認
2. manifest.jsonが正しく設定されているか確認
3. Service Workerが登録されているか確認
   ```javascript
   navigator.serviceWorker.getRegistrations().then(console.log)
   ```

---

## デプロイメントの問題

### 問題: Vercelデプロイが失敗する

**症状**
- ビルドエラー
- デプロイ後も古いバージョンが表示される

**解決方法**
1. Vercelダッシュボードでビルドログを確認
2. よくある原因：
   - TypeScriptの型エラー
   - 環境変数の未設定
   - node_modulesの問題 → `rm -rf node_modules && npm install`

### 問題: 環境変数が反映されない

**症状**
- APIキーが undefined
- 環境依存の設定が機能しない

**解決方法**
1. Vercelダッシュボードで環境変数を設定
2. 環境変数名の確認（NEXT_PUBLIC_プレフィックスが必要な場合）
3. 再デプロイを実行

### 問題: デプロイ後の反映遅延

**症状**
- GitHubにプッシュしたがVercelに反映されない
- 古いバージョンが表示され続ける

**解決方法**
1. Vercelダッシュボードでデプロイ状況を確認
2. キャッシュクリア：
   - ブラウザ: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
   - CDN: Vercelダッシュボードから手動でパージ
3. デプロイのトリガー確認（mainブランチへのプッシュか）

---

## パフォーマンスの問題

### 問題: 初回読み込みが遅い

**症状**
- ページ表示まで3秒以上かかる
- Lighthouse スコアが低い

**解決方法**
1. バンドルサイズの確認
   ```bash
   npm run analyze
   ```
2. 不要な依存関係の削除
3. 動的インポートの活用
   ```javascript
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

### 問題: API レスポンスが遅い

**症状**
- 提案取得に時間がかかる
- タイムアウトエラー

**解決方法**
1. エッジファンクションの利用
2. 静的データのキャッシュ
3. CDNの活用

---

## 開発環境の問題

### 問題: npm install が失敗する

**症状**
- 依存関係のエラー
- peer dependencyの警告

**解決方法**
```bash
# キャッシュクリア
npm cache clean --force

# node_modules削除
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

### 問題: TypeScriptエラー

**症状**
- 型エラーでビルドが失敗
- エディタに赤い波線

**解決方法**
1. 型定義ファイルの確認
2. tsconfig.jsonの設定確認
3. @typesパッケージのインストール
   ```bash
   npm install --save-dev @types/[パッケージ名]
   ```

### 問題: ESLintエラー

**症状**
- Lintエラーでコミットできない
- 警告が大量に表示される

**解決方法**
1. 自動修正を実行
   ```bash
   npm run lint:fix
   ```
2. .eslintrcの設定確認
3. 必要に応じてルールを調整

---

## デバッグのヒント

### APIデバッグ
1. test-api.jsを使用してエンドポイントをテスト
2. Vercelのファンクションログを確認
3. console.logをAPI内に追加（本番では削除）

### フロントエンドデバッグ
1. React Developer Toolsの活用
2. Network タブでAPIコールを確認
3. Console でエラーメッセージを確認

### 一般的なデバッグフロー
1. エラーメッセージを正確に読む
2. 最小限の再現コードを作成
3. 一つずつ問題を切り分ける
4. ドキュメントとコミュニティを活用

---

## 緊急時の対応

### 本番環境が完全にダウンした場合
1. Vercelのステータスページを確認
2. 最後の正常なデプロイにロールバック
3. 静的なメンテナンスページを表示

### データ損失の可能性がある場合
1. 現時点では永続的なデータ保存なし（Phase 1）
2. ローカルストレージのバックアップは不要

### セキュリティインシデント
1. 影響を受けたAPIキーを即座に無効化
2. 新しいキーを生成して環境変数を更新
3. アクセスログを確認

---

## よくある質問（FAQ）

**Q: デプロイ後どのくらいで反映される？**
A: 通常2-3分です。5分以上かかる場合は問題がある可能性があります。

**Q: ローカルでは動くが本番で動かない**
A: 環境変数、Node.jsバージョン、ビルド設定を確認してください。

**Q: 特定のブラウザでのみ問題が発生する**
A: ブラウザの互換性を確認し、必要に応じてポリフィルを追加してください。

---

## 連絡先とサポート

問題が解決しない場合は、以下の情報と共に報告してください：
- エラーメッセージ（スクリーンショット含む）
- 再現手順
- 環境情報（OS、ブラウザ、バージョン）
- 関連するログ

最終更新: 2025-07-09