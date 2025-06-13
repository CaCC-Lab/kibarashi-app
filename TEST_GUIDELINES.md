# テスト作成ガイドライン - モック禁止ルール

## 🚫 絶対的禁止事項

### モックの使用は一切禁止
以下のすべてが禁止されています：
- `jest.mock()`, `vi.mock()`
- `mockResolvedValue()`, `mockRejectedValue()`
- `mockImplementation()`, `mockReturnValue()`
- スタブ、スパイ、フェイクオブジェクト
- 任意のモッキングライブラリ

## ✅ 正しいテストの書き方

### 1. 実際のサービスを使用する
```typescript
// ❌ 間違い: モックを使用
jest.mock('../services/api');
const mockApi = { fetch: jest.fn() };

// ✅ 正解: 実際のサービスを使用
import { actualApi } from '../services/api';
const result = await actualApi.fetch(); // 実際のAPIを呼ぶ
```

### 2. テスト環境の準備
```typescript
// テスト用の環境変数を設定
beforeAll(() => {
  process.env.GEMINI_API_KEY = 'test-api-key';
  process.env.NODE_ENV = 'test';
});
```

### 3. エラーケースのテスト
```typescript
// ❌ 間違い: エラーをモック
mockApi.mockRejectedValue(new Error());

// ✅ 正解: 実際にエラーを発生させる条件を作る
// 例: 無効なパラメータを渡す、環境変数を削除する等
delete process.env.API_KEY;
const result = await service.call(); // 実際にエラーが発生
```

## 🏗️ テスト環境構築

### 1. テスト用設定ファイル
```bash
# .env.test
GEMINI_API_KEY=your-test-api-key
NODE_ENV=test
PORT=8081
```

### 2. テスト用データベース（Phase 2以降）
- 本番とは別のテスト専用DB
- 各テスト実行前にクリーンアップ

### 3. 外部APIのテスト
- 実際のAPIを使用（レート制限に注意）
- テスト用のサンドボックス環境を利用
- APIキーは環境変数で管理

## 📝 テストケース設計

### 1. 実際の使用シナリオに基づく
```typescript
describe('実際のユーザーシナリオ', () => {
  it('職場で5分の休憩時に提案を取得する', async () => {
    // 実際のAPIを呼び出し
    const suggestions = await getSuggestions('workplace', 5);
    
    // 実際のレスポンスを検証
    expect(suggestions).toHaveLength(3);
    expect(suggestions[0].duration).toBeLessThanOrEqual(5);
  });
});
```

### 2. エッジケースも実際の動作で確認
```typescript
it('APIキーがない場合、フォールバックが動作する', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  
  const suggestions = await getSuggestions('home', 15);
  expect(suggestions).toBeDefined(); // フォールバックデータ
  
  process.env.GEMINI_API_KEY = originalKey;
});
```

## 🚨 レビュー時のチェックポイント

1. **モック検出パターン**
   - `mock`, `Mock`, `stub`, `spy` を含む行
   - `jest.fn()`, `vi.fn()` の使用
   - `@jest/globals` のインポート

2. **自動チェック**
   - ESLintルールで自動検出
   - CI/CDでモック使用を拒否

3. **手動確認事項**
   - 実際のサービスが呼ばれているか
   - テスト環境が適切に設定されているか
   - エラーケースが実際の条件で再現されているか

## 💡 なぜモックを使わないのか

### 理念
「コードは理解の架け橋」- 実際の動作を理解するには、実際の動作をテストする必要がある

### 実践的理由
1. **本番環境との乖離を防ぐ**
   - モックは「想定」でしかない
   - 実際のAPIの挙動は予測と異なることが多い

2. **統合的な問題の早期発見**
   - ネットワークエラー
   - タイムアウト
   - レート制限
   - 認証エラー

3. **仕様変更への対応**
   - 外部APIの仕様変更を即座に検知
   - フォールバック機能の実動作確認

## 🔧 実装時の注意

### 1. パフォーマンス
- 実際のAPI呼び出しは時間がかかる
- タイムアウトを適切に設定（30秒程度）
- 並列実行には注意

### 2. コスト
- API利用料金に注意
- テスト専用の無料枠を活用
- 必要最小限の呼び出しに留める

### 3. 環境分離
- テスト用APIキー
- テスト用エンドポイント（可能な場合）
- テストデータの汚染防止

## 📚 参考例

### バックエンドテスト
```typescript
// backend/src/services/suggestion/generator.test.ts
import { generateSuggestions } from './generator';

describe('実際のGemini APIを使用した提案生成', () => {
  it('実際に提案を生成する', async () => {
    const suggestions = await generateSuggestions('workplace', 5);
    // 実際のAPIレスポンスを検証
  });
});
```

### フロントエンドテスト
```typescript
// frontend/src/hooks/useSuggestions.test.ts
import { renderHook } from '@testing-library/react-hooks';
import { useSuggestions } from './useSuggestions';

describe('実際のAPIを使用したフック', () => {
  it('実際にAPIから提案を取得する', async () => {
    const { result } = renderHook(() => useSuggestions());
    // 実際のAPI呼び出しを待つ
  });
});
```

---

**重要**: このガイドラインは個人開発規約に基づいています。一般的なベストプラクティスとは異なりますが、「理解の架け橋」としてのコードを実現するために必要な方針です。