# カラーパレット移行戦略

## 🎯 移行の基本方針

### 段階的移行アプローチ
**一度にすべてを変更するのではなく、リスクを最小化した段階的移行を実施**

1. **Phase 1**: 基盤設定とコアシステム
2. **Phase 2**: 主要コンポーネント群
3. **Phase 3**: 機能別UI群
4. **Phase 4**: テスト更新と検証
5. **Phase 5**: 最終調整と最適化

## 📊 影響範囲分析

### 色使用状況（29ファイル検出）

#### 🔴 Critical（即座に影響する）
- **tailwind.config.js**: 色定義の根幹
- **main.tsx**: アプリケーション起点
- **App.tsx**: メインレイアウト
- **Header.tsx**: ナビゲーション

#### 🟡 High Impact（重要機能）
- **SuggestionCard.tsx**: 提案表示の中核
- **SuggestionDetail.tsx**: 詳細表示
- **SituationSelector.tsx**: 初期選択画面  
- **DurationSelector.tsx**: 時間選択画面

#### 🟢 Medium Impact（補助機能）
- **FavoriteButton.tsx**: お気に入り機能
- **HistoryList.tsx**: 履歴表示
- **Settings.tsx**: 設定画面
- **AudioPlayer.tsx**: 音声プレイヤー

#### ⚪ Low Impact（表示系）
- **Loading.tsx**: ローディング表示
- **ErrorMessage.tsx**: エラー表示
- **Footer.tsx**: フッター

## 🎨 新カラーパレット定義

### Tailwind拡張設定
```javascript
theme: {
  extend: {
    colors: {
      // 新しいプライマリカラー（メインカラー）
      primary: {
        50: '#f4f4f8',   // 最も薄い
        100: '#e8e8f0',  
        200: '#d1d1e1',
        300: '#b0b0d0',
        400: '#8a8abb',
        500: '#3b3b6b',  // ベースカラー
        600: '#32325c',
        700: '#2a2a4e',
        800: '#212140',
        900: '#191932',  // 最も濃い
      },
      
      // 新しいセカンダリカラー（サブカラー）
      secondary: {
        50: '#fdf4f4',
        100: '#fbe8e8',
        200: '#f6d1d1', 
        300: '#efb0b0',
        400: '#e68a8a',
        500: '#D24848',  // ベースカラー
        600: '#c23e3e',
        700: '#a13333',
        800: '#852929',
        900: '#6f2424',
      },
      
      // 新しいアクセントカラー
      accent: {
        50: '#fdfcf7',
        100: '#fbf8ef',
        200: '#f6f0d7',
        300: '#efe4bb',
        400: '#e6d399',
        500: '#ccaf60',  // ベースカラー
        600: '#b89d54',
        700: '#9a8347',
        800: '#7d6a3c',
        900: '#665733',
      },
      
      // テキストカラー調整
      text: {
        primary: '#191919',    // 基本文字色
        secondary: '#4a4a4a',  // セカンダリテキスト
        muted: '#6b6b6b',      // 薄いテキスト
        inverse: '#ffffff',    // 反転テキスト
      }
    }
  }
}
```

## 📋 移行計画（詳細）

### Phase 1: 基盤設定（Day 1）

#### 1.1 Tailwind設定更新
- [ ] `tailwind.config.js` の colors セクション更新
- [ ] CSS変数定義の追加
- [ ] ダークモード対応色の計算

#### 1.2 基本テスト
- [ ] 新色設定のビルド確認
- [ ] 基本表示の動作確認

### Phase 2: コアコンポーネント（Day 2-3）

#### 2.1 ナビゲーション系
**優先順位: 最高**
```
- Header.tsx
- MainLayout.tsx  
- Footer.tsx
```

**移行方針:**
- `primary-500` → 新primary-500 (#3b3b6b)
- `blue-500` → primary-500
- 削除・危険アクション → secondary-500 (#D24848)

#### 2.2 インタラクション系
**優先順位: 最高**
```
- DarkModeToggle.tsx
- Loading.tsx
- ErrorMessage.tsx
```

**移行方針:**
- 成功状態 → accent-500 (#ccaf60)
- エラー状態 → secondary-500 (#D24848)
- ローディング → primary-500

### Phase 3: 機能コンポーネント（Day 3-4）

#### 3.1 選択・入力系
```
- SituationSelector.tsx
- DurationSelector.tsx
- SuggestionCard.tsx
```

**人間工学的改善:**
- ホバー状態の視認性向上
- 選択状態の明確化
- フォーカス状態の改善

#### 3.2 表示・フィードバック系
```
- SuggestionDetail.tsx
- SuggestionList.tsx
- AudioPlayer.tsx
```

**アフォーダンス改善:**
- 再生可能ボタンの明確化
- 進行状態の視覚化
- 完了状態の達成感演出

### Phase 4: 特殊機能UI（Day 4-5）

#### 4.1 お気に入り・履歴系
```
- FavoriteButton.tsx
- FavoritesList.tsx
- HistoryList.tsx
- HistoryItem.tsx
- HistoryStats.tsx
- HistoryFilter.tsx
```

**シグニファイア最適化:**
- お気に入り: accent-500 (金色) でプレミアム感
- 履歴: primary-500 で安定感
- 統計: グラデーションで情報の豊富さ

#### 4.2 設定・管理系
```
- Settings.tsx
```

**安全性の強調:**
- 危険なアクション(削除): secondary-500
- 安全なアクション: primary-500
- 成功フィードバック: accent-500

### Phase 5: テスト更新（Day 5-6）

#### 5.1 単体テスト更新
- [ ] 色関連のテストケース更新
- [ ] スナップショットテスト更新
- [ ] クラス名変更の反映

#### 5.2 統合テスト
- [ ] E2Eテストの実行
- [ ] 視覚回帰テスト
- [ ] アクセシビリティテスト

## 🧪 検証・テスト戦略

### 自動化テスト
```bash
# コントラスト比チェック
npm run test:contrast

# アクセシビリティテスト  
npm run test:a11y

# 視覚回帰テスト
npm run test:visual
```

### 手動検証項目
- [ ] 各ブラウザでの表示確認
- [ ] ダークモード切り替え確認
- [ ] 色覚異常シミュレーション
- [ ] 長時間使用での目の疲労テスト

## ⚠️ リスク管理

### 予想されるリスク
1. **既存テストの破綻**
   - 対策: テストケースの段階的更新
   
2. **ダークモード互換性**
   - 対策: ダークモード専用色の慎重な設計
   
3. **アクセシビリティ低下**
   - 対策: 各段階でのコントラスト比チェック

4. **ユーザーの混乱**
   - 対策: 段階的リリースと説明

### ロールバック計画
- Git の feature branch での作業
- 各 Phase ごとのコミット
- 問題発生時の即座復旧手順

## 📊 進捗管理

### マイルストーン
- **M1**: Tailwind設定完了
- **M2**: コアコンポーネント完了  
- **M3**: 全機能コンポーネント完了
- **M4**: テスト完了
- **M5**: 本番リリース準備完了

### 品質ゲート
各フェーズで以下を満たすこと:
- [ ] コントラスト比 WCAG AA 準拠
- [ ] 既存機能の動作確認
- [ ] 新規テストの実行成功
- [ ] パフォーマンス劣化なし

---

この戦略に従って、安全で効果的なカラーパレット移行を実行します。