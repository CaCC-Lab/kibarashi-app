# テスト戦略

このファイルは「5分気晴らし」アプリケーションのテスト戦略と実行方針を定義します。
**重要**: 新機能の実装前に必ずこの戦略に従ってテストを作成してください。

## 目次

1. [テストの目的](#テストの目的)
2. [テストピラミッドと各テストの責務](#テストピラミッドと各テストの責務)
3. [技術スタックと設定](#技術スタックと設定)
4. [テスト実行フロー](#テスト実行フロー)
5. [カバレッジ目標](#カバレッジ目標)
6. [CI/CD統合](#cicd統合)
7. [テストデータ管理](#テストデータ管理)
8. [パフォーマンステスト](#パフォーマンステスト)

## テストの目的

1. **高品質なユーザー体験の提供**: バグのない安定したアプリケーションを提供する
2. **リグレッション防止**: 新機能追加やリファクタリング時の意図しない不具合を防ぐ
3. **仕様のドキュメント化**: テストコードが生きた仕様書として機能する
4. **開発速度の向上**: 自動テストにより手動テストの負荷を軽減する
5. **チーム開発の安定性**: 複数人での開発時の品質を保つ

## テストピラミッドと各テストの責務

### 1. 単体テスト (Unit Tests) - 70% - 開発の土台

**目的**: 各部品が単体で正しく動作することを保証する

#### フロントエンド単体テスト
- **ツール**: Vitest + React Testing Library
- **対象**:
  - 個別のReactコンポーネント（props、state、イベントハンドリング）
  - カスタムフック（useSuggestions、useDurationなど）
  - ユーティリティ関数（validators.ts、helpers.tsなど）
  - 型定義の妥当性確認

```typescript
// 例: Button コンポーネントのテスト
describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### バックエンド単体テスト
- **ツール**: Jest/Vitest + Supertest
- **対象**:
  - Service層のビジネスロジック
  - ユーティリティ関数
  - バリデーション関数
  - Gemini/TTS APIクライアント（モック使用）

```typescript
// 例: SuggestionService のテスト
describe('SuggestionService', () => {
  test('generates suggestions for workplace situation', async () => {
    const mockGeminiResponse = { suggestions: [{ title: 'Deep breathing' }] };
    vi.spyOn(geminiClient, 'generateSuggestions').mockResolvedValue(mockGeminiResponse);
    
    const result = await suggestionService.getSuggestions('workplace', 5);
    expect(result.suggestions).toHaveLength(3);
    expect(result.suggestions[0]).toHaveProperty('title');
  });
});
```

### 2. 結合テスト (Integration Tests) - 20% - 機能の連携確認

**目的**: モジュール間の連携が正しく動作することを確認する

#### フロントエンド結合テスト
- **ツール**: React Testing Library + MSW (Mock Service Worker)
- **対象**:
  - 複数コンポーネントを組み合わせたユーザー操作フロー
  - API通信を含むコンポーネント動作
  - ルーティングを含むページ遷移

```typescript
// 例: 提案取得フローのテスト
describe('Suggestion Flow Integration', () => {
  test('user can select situation and get suggestions', async () => {
    // MSWでAPIレスポンスをモック
    server.use(
      rest.get('/api/v1/suggestions', (req, res, ctx) => {
        return res(ctx.json({ suggestions: mockSuggestions }));
      })
    );

    render(<App />);
    
    // 状況選択
    fireEvent.click(screen.getByText('職場'));
    fireEvent.click(screen.getByText('5分'));
    fireEvent.click(screen.getByText('提案を見る'));
    
    // 提案表示を確認
    await waitFor(() => {
      expect(screen.getByText('深呼吸エクササイズ')).toBeInTheDocument();
    });
  });
});
```

#### バックエンド結合テスト
- **ツール**: Supertest + Test Database
- **対象**:
  - APIエンドポイントのテスト（Controller → Service層の連携）
  - ミドルウェアとルートの連携
  - 外部APIとの統合（実際のAPI使用）

```typescript
// 例: API統合テスト
describe('Suggestions API Integration', () => {
  test('GET /api/v1/suggestions returns suggestions', async () => {
    const response = await request(app)
      .get('/api/v1/suggestions')
      .query({ situation: 'workplace', duration: 5 })
      .expect(200);
    
    expect(response.body.suggestions).toHaveLength(3);
    expect(response.body.suggestions[0]).toHaveProperty('id');
    expect(response.body.suggestions[0]).toHaveProperty('title');
  });
});
```

### 3. E2Eテスト (End-to-End Tests) - 10% - ユーザー体験の保証

**目的**: 実際のブラウザでユーザーの主要操作フローが動作することを確認する

- **ツール**: Playwright（標準推奨）
- **対象**:
  - 主要なユーザーストーリー
  - クリティカルパス（提案取得、音声再生）
  - PWA機能（オフライン動作、インストール）

```typescript
// 例: E2Eテスト（Playwright）
test('user can get suggestions and play audio', async ({ page }) => {
  await page.goto('/');
  
  // 状況と時間を選択
  await page.click('[data-testid="situation-workplace"]');
  await page.click('[data-testid="duration-5"]');
  await page.click('[data-testid="get-suggestions"]');
  
  // 提案が表示されることを確認
  await expect(page.locator('[data-testid="suggestion-card"]')).toHaveCount(3);
  
  // 音声再生ボタンをクリック
  await page.click('[data-testid="play-audio"]');
  
  // 音声プレーヤーが表示されることを確認
  await expect(page.locator('[data-testid="audio-player"]')).toBeVisible();
});
```

## 技術スタックと設定

### フロントエンド
```json
{
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.6",
  "@testing-library/user-event": "^14.5.2",
  "msw": "^2.0.0"
}
```

### バックエンド
```json
{
  "jest": "^29.7.0",
  "supertest": "^6.3.3",
  "@types/supertest": "^6.0.2",
  "testcontainers": "^10.0.0"
}
```

### E2Eテスト
```json
{
  "@playwright/test": "^1.40.1"
}
```

## テスト実行フロー

### ローカル開発環境

```bash
# 全テスト実行
npm run test

# フロントエンド単体テスト（ウォッチモード）
cd frontend && npm run test:watch

# バックエンド単体テスト
cd backend && npm run test

# 結合テスト
npm run test:integration

# E2Eテスト（ローカル）
npm run test:e2e:local

# カバレッジレポート付きテスト
npm run test:coverage
```

### Git フック統合

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test:unit
```

## カバレッジ目標

### 単体テスト
- **全体目標**: 85%以上
- **クリティカル部分**: 95%以上（決済処理、認証、API連携）
- **UI コンポーネント**: 80%以上

### 結合テスト
- **APIエンドポイント**: 100%（全エンドポイント）
- **主要ユーザーフロー**: 100%

### E2Eテスト
- **クリティカルパス**: 100%
- **ブラウザ対応**: Chrome、Safari、Firefox（最新2バージョン）

### カバレッジレポート設定

```javascript
// vitest.config.ts (frontend)
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85
      }
    }
  }
});
```

## CI/CD統合

### GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3
      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    steps:
      - uses: actions/checkout@v3
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test artifacts
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## テストデータ管理

### 1. テストフィクスチャ

```typescript
// tests/fixtures/suggestions.ts
export const mockSuggestions = [
  {
    id: 'test-1',
    title: '深呼吸エクササイズ',
    description: '4秒で息を吸い、4秒止めて、4秒で吐く',
    duration: 5,
    category: '認知的',
    steps: ['椅子に座り、背筋を伸ばす', '鼻から4秒かけて息を吸う']
  }
];
```

### 2. テスト用データベース

```typescript
// tests/helpers/database.ts
export async function setupTestDatabase() {
  const testDb = new TestContainer('postgres:16')
    .withEnvironment({ POSTGRES_DB: 'test', POSTGRES_PASSWORD: 'test' })
    .withExposedPorts(5432);
  
  const container = await testDb.start();
  process.env.DATABASE_URL = `postgresql://postgres:test@${container.getHost()}:${container.getMappedPort(5432)}/test`;
  
  return container;
}
```

### 3. API モック（MSW）

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/v1/suggestions', (req, res, ctx) => {
    const situation = req.url.searchParams.get('situation');
    const duration = req.url.searchParams.get('duration');
    
    return res(
      ctx.status(200),
      ctx.json({ suggestions: mockSuggestions })
    );
  }),
  
  rest.post('/api/v1/tts', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ audioUrl: 'data:audio/mp3;base64,mock-audio-data' })
    );
  })
];
```

## パフォーマンステスト

### 1. ロードテスト（将来対応）

```typescript
// tests/performance/load.test.ts
import { test, expect } from '@playwright/test';

test('load test - suggestions API', async ({ request }) => {
  const start = Date.now();
  
  const promises = Array.from({ length: 10 }, () =>
    request.get('/api/v1/suggestions?situation=workplace&duration=5')
  );
  
  const responses = await Promise.all(promises);
  const end = Date.now();
  
  responses.forEach(response => {
    expect(response.status()).toBe(200);
  });
  
  expect(end - start).toBeLessThan(5000); // 5秒以内
});
```

### 2. フロントエンドパフォーマンス

```typescript
// tests/performance/web-vitals.test.ts
test('Core Web Vitals', async ({ page }) => {
  await page.goto('/');
  
  const lcp = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries[entries.length - 1].startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
  });
  
  expect(lcp).toBeLessThan(2500); // LCP 2.5秒以内
});
```

## テスト実行スケジュール

### 開発フロー
1. **機能開発前**: 失敗するテストを作成（TDD）
2. **実装中**: ユニットテストを随時実行
3. **機能完成後**: 結合テストとE2Eテストを実行
4. **プルリクエスト作成時**: CI で全テスト実行

### 定期実行
- **毎日夜間**: フル E2E テストスイート実行
- **週次**: パフォーマンステスト実行
- **リリース前**: 全テスト + 手動テスト実行

## トラブルシューティング

### よくある問題

#### フロントエンドテストが不安定
```bash
# 非同期処理の待機
await waitFor(() => {
  expect(screen.getByText('期待するテキスト')).toBeInTheDocument();
});

# ユーザーイベントの適切な使用
const user = userEvent.setup();
await user.click(button);
```

#### E2Eテストのタイムアウト
```typescript
// 待機時間の調整
await page.waitForSelector('[data-testid="loading"]', { state: 'hidden' });
await page.waitForLoadState('networkidle');
```

#### テストが遅い
```bash
# 並列実行の設定
npm run test -- --reporter=verbose --threads

# 不要なテストファイルの除外
npm run test -- --exclude='**/slow.test.ts'
```

---

## 次のステップ

1. **immediate**: このドキュメントに基づいてテスト設定ファイルを作成
2. **short-term**: 既存コードの単体テストを80%以上のカバレッジで作成
3. **medium-term**: CI/CD パイプラインにテスト実行を統合
4. **long-term**: パフォーマンステストとモニタリングの自動化

---

最終更新: 2025-01-07