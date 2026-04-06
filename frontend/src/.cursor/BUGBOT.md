# frontend/src/ 専用ルール

## 追加チェック

### React固有
- hooks の依存配列の誤り・漏れ
- useEffect のクリーンアップ漏れ
- 不要な再レンダリング（useMemo/useCallback の欠如）
- key prop の不適切な使用

### 型安全性
- any型の使用（P0として報告）
- 型アサーション（as）の不適切な使用
- unknown + 型ガードの推奨

### パフォーマンス
- 不要なループ内処理
- 大量データのメモリロード
- バンドルサイズへの影響

## 禁止事項

- console.log の使用
- any型の使用
- TODO/FIXMEコメントの放置
- ハードコードされたAPIキー・設定値
