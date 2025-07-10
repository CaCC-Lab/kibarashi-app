# データソース透明性機能

## 概要

ユーザーがアプリで表示される気晴らし提案がどのように生成されたかを理解できるよう、各提案の右上に小さなバッジを表示する機能です。この機能により、AIによる生成、フォールバックデータの使用、キャッシュからの取得などが一目でわかります。

## 設計思想

### プログレッシブディスクロージャー

ストレスを抱えたユーザーに情報過多を避けるため、段階的な情報開示を採用しました：

1. **通常モード**: 最小限の情報（アイコンとラベルのみ）
2. **ホバー時**: ツールチップで簡単な説明
3. **デバッグモード**: 開発者向けの詳細情報（応答時間、APIキーインデックスなど）

### データソースの種類

- **AI生成** (`ai`): Gemini APIによる動的生成
- **フォールバック** (`fallback`): 事前定義された提案データ
- **キャッシュ** (`cache`): 以前の応答を再利用
- **エラー** (`error`): API失敗時のフォールバック

## 実装詳細

### コンポーネント構成

```typescript
// DataSourceBadge.tsx
export interface DataSourceBadgeProps {
  source: DataSource;
  showDetails?: boolean;  // デバッグモード時に詳細表示
  apiKeyIndex?: number;   // 使用されたAPIキーのインデックス
  responseTime?: number;  // レスポンス時間（ミリ秒）
  className?: string;
}
```

### 視覚デザイン

```
通常表示:
┌─────────────┐
│ ✨ AI生成    │  紫色バッジ
└─────────────┘

デバッグモード:
┌──────────────────────┐
│ ✨ AI生成            │
│ 245ms | Key #2       │  応答時間とAPIキー
└──────────────────────┘
```

### アクセシビリティ

- ARIA属性による適切なラベル付け
- 高コントラストモード対応
- キーボードナビゲーション対応
- スクリーンリーダー対応

## 使用方法

### 基本的な使用

```tsx
<DataSourceBadge 
  source="ai"
  className="absolute top-2 right-2"
/>
```

### デバッグモード付き

```tsx
<DataSourceBadge 
  source="ai"
  showDetails={true}
  apiKeyIndex={2}
  responseTime={245}
/>
```

## テスト方法

1. **手動テスト**
   ```bash
   ./test-data-source-badges.sh
   ```

2. **ユニットテスト**
   ```bash
   cd frontend
   npm test -- DataSourceBadge.test.tsx
   ```

3. **E2Eテスト**
   ```bash
   npm run test:e2e -- --grep "data source badge"
   ```

## 設定

### デバッグモードの有効化

開発環境では、画面右下のトグルボタンでデバッグモードのON/OFFが可能です。設定はローカルストレージに保存されます。

```javascript
localStorage.setItem('kibarashi-debug-mode', 'true');
```

### 環境変数

```env
# Gemini APIキーが設定されていない場合、自動的にfallbackモードになります
GEMINI_API_KEY=your-api-key
```

## 今後の拡張

1. **APIキーローテーション表示**: 複数のAPIキーを使用している場合、どのキーが使用されたかを表示
2. **パフォーマンスメトリクス**: 応答時間の統計情報を収集・表示
3. **ユーザー設定**: バッジの表示/非表示をユーザーが選択可能に
4. **カスタマイズ**: バッジの位置やスタイルのカスタマイズオプション

## トラブルシューティング

### バッジが表示されない

1. `dataSource`プロパティがAPIレスポンスに含まれているか確認
2. バックエンドが正しくメタデータを設定しているか確認
3. フロントエンドの型定義が最新か確認

### デバッグモードが動作しない

1. 本番環境ではデバッグモードは無効化されます
2. ローカルストレージの権限を確認
3. ブラウザの開発者ツールでエラーを確認

## 関連ファイル

- `/frontend/src/components/common/DataSourceBadge.tsx` - メインコンポーネント
- `/frontend/src/components/debug/DebugModeToggle.tsx` - デバッグモード切り替え
- `/backend/src/services/suggestion/generator.ts` - メタデータ生成ロジック
- `/frontend/src/services/api/types.ts` - 型定義