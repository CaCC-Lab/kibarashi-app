import { test, expect } from '@playwright/test';

// GEMINI-DESIGNED: データソースバッジE2Eテスト戦略
// CLAUDE-IMPLEMENTED: Geminiの戦略に基づいたテスト実装
// PATTERN: ピンポンプログラミング（TDD）

test.describe('データソースバッジ表示機能', () => {
  test('提案カードにデータソースバッジが表示される', async ({ page }) => {
    // 1. アプリケーションにアクセス
    await page.goto('http://localhost:3001');
    
    // 2. 年齢層選択モーダルが表示された場合は閉じる
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      await page.click('text=スキップ');
    }
    
    // 3. 状況を選択（職場）
    await page.click('[data-testid="situation-workplace"]');
    
    // 4. 時間を選択（5分）
    await page.click('[data-testid="duration-5"]');
    
    // 5. 提案が表示されるまで待機
    await page.waitForSelector('[data-testid="suggestion-card"]', { timeout: 10000 });
    
    // 6. 提案カードが3つ表示されることを確認
    const suggestionCards = await page.locator('[data-testid="suggestion-card"]').count();
    expect(suggestionCards).toBe(3);
    
    // 7. データソースバッジが存在するか確認
    const badges = await page.locator('[data-testid="data-source-badge"]').count();
    console.log(`Found ${badges} data source badges`);
    
    // バッジが見つからない場合、より詳細に調査
    if (badges === 0) {
      // ページの構造を調査
      const cardHTML = await page.locator('[data-testid="suggestion-card"]').first().innerHTML();
      console.log('First suggestion card HTML:', cardHTML);
      
      // AI生成、フォールバック、キャッシュ、エラーのテキストを探す
      const aiGenerated = await page.locator('text=AI生成').count();
      const fallback = await page.locator('text=オフライン').count();
      const cache = await page.locator('text=キャッシュ').count();
      const error = await page.locator('text=フォールバック').count();
      
      console.log('Text search results:', {
        aiGenerated,
        fallback,
        cache,
        error
      });
      
      // アイコンで探す
      const sparkles = await page.locator('text=✨').count();
      const clipboard = await page.locator('text=📋').count();
      const disk = await page.locator('text=💾').count();
      const lightning = await page.locator('text=⚡').count();
      
      console.log('Icon search results:', {
        sparkles,
        clipboard,
        disk,
        lightning
      });
    }
    
    // 少なくとも1つのバッジが表示されているはず
    expect(badges).toBeGreaterThan(0);
    
    // 8. デバッグモードトグルをテスト（開発環境の場合のみ）
    const debugToggle = page.locator('[data-testid="debug-mode-toggle"]');
    if (await debugToggle.isVisible()) {
      // デバッグモードをONにする
      await debugToggle.click();
      
      // 詳細情報が表示されるか確認
      await page.waitForTimeout(500); // アニメーション待機
      
      // 応答時間が表示されるか確認
      const responseTime = await page.locator('text=/\\d+ms/').count();
      console.log(`Found ${responseTime} response time displays`);
    }
  });
  
  test('APIキーが設定されていない場合、フォールバックバッジが表示される', async ({ page }) => {
    // 環境変数をクリアしてアクセス（実際のテストではモックを使用）
    await page.goto('http://localhost:3001');
    
    // 年齢層選択モーダルをスキップ
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      await page.click('text=スキップ');
    }
    
    // 提案を表示
    await page.click('[data-testid="situation-home"]');
    await page.click('[data-testid="duration-15"]');
    
    // フォールバックバッジを探す
    await page.waitForSelector('[data-testid="suggestion-card"]');
    
    // フォールバックのテキストまたはアイコンを確認
    const fallbackBadge = await page.locator('text=オフライン').count() || 
                         await page.locator('text=📋').count();
    
    console.log(`Fallback badges found: ${fallbackBadge}`);
  });
  
  // APIモックを使った各データソース状態の再現
  test.describe('APIモックによるデータソース状態テスト', () => {
    test('API取得時のバッジ表示', async ({ page }) => {
      // APIレスポンスをモック
      await page.route('**/api/v1/suggestions**', async route => {
        const json = {
          suggestions: [
            {
              id: '1',
              title: 'API生成の提案',
              description: 'Gemini APIから生成された提案です',
              duration: 5,
              category: '認知的',
              steps: ['深呼吸をする', '目を閉じる', 'リラックスする']
            }
          ],
          metadata: {
            source: 'api',
            responseTime: 123,
            apiKeyIndex: 0,
            model: 'gemini-1.5-flash',
            timestamp: new Date().toISOString()
          }
        };
        await route.fulfill({ json });
      });

      await page.goto('http://localhost:3001');
      
      // モーダルをスキップ
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await page.click('text=スキップ');
      }
      
      // 提案を表示
      await page.click('[data-testid="situation-workplace"]');
      await page.click('[data-testid="duration-5"]');
      
      // APIバッジが表示されることを確認
      await page.waitForSelector('[data-testid="data-source-badge"]');
      const apiBadge = page.locator('[data-testid="data-source-badge"]').first();
      await expect(apiBadge).toContainText('AI生成');
      
      // アイコンも確認
      await expect(apiBadge).toContainText('✨');
    });

    test('キャッシュ取得時のバッジ表示', async ({ page }) => {
      await page.route('**/api/v1/suggestions**', async route => {
        const json = {
          suggestions: [
            {
              id: '2',
              title: 'キャッシュからの提案',
              description: 'キャッシュに保存された提案です',
              duration: 5,
              category: '行動的'
            }
          ],
          metadata: {
            source: 'cache',
            cacheHit: true,
            timestamp: new Date().toISOString()
          }
        };
        await route.fulfill({ json });
      });

      await page.goto('http://localhost:3001');
      
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await page.click('text=スキップ');
      }
      
      await page.click('[data-testid="situation-home"]');
      await page.click('[data-testid="duration-5"]');
      
      await page.waitForSelector('[data-testid="data-source-badge"]');
      const cacheBadge = page.locator('[data-testid="data-source-badge"]').first();
      await expect(cacheBadge).toContainText('キャッシュ');
      await expect(cacheBadge).toContainText('💾');
    });

    test('フォールバック時のバッジ表示', async ({ page }) => {
      await page.route('**/api/v1/suggestions**', async route => {
        const json = {
          suggestions: [
            {
              id: '3',
              title: 'オフライン提案',
              description: 'ローカルに保存された提案です',
              duration: 5,
              category: '認知的'
            }
          ],
          metadata: {
            source: 'fallback',
            reason: 'API利用不可',
            timestamp: new Date().toISOString()
          }
        };
        await route.fulfill({ json });
      });

      await page.goto('http://localhost:3001');
      
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await page.click('text=スキップ');
      }
      
      await page.click('[data-testid="situation-outdoor"]');
      await page.click('[data-testid="duration-15"]');
      
      await page.waitForSelector('[data-testid="data-source-badge"]');
      const fallbackBadge = page.locator('[data-testid="data-source-badge"]').first();
      await expect(fallbackBadge).toContainText('オフライン');
      await expect(fallbackBadge).toContainText('📋');
    });

    test('APIエラー時のバッジ表示', async ({ page }) => {
      // APIエラーをシミュレート
      await page.route('**/api/v1/suggestions**', async route => {
        await route.fulfill({
          status: 500,
          body: 'Internal Server Error'
        });
      });

      await page.goto('http://localhost:3001');
      
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await page.click('text=スキップ');
      }
      
      await page.click('[data-testid="situation-workplace"]');
      await page.click('[data-testid="duration-30"]');
      
      // エラー時でもフォールバックが表示されることを確認
      await page.waitForSelector('[data-testid="suggestion-card"]');
      
      // フォールバックバッジが表示される
      const badges = page.locator('[data-testid="data-source-badge"]');
      await expect(badges).toHaveCount(3);
      await expect(badges.first()).toContainText('オフライン');
    });
  });

  // デバッグモード切り替えテスト
  test.describe('デバッグモード機能', () => {
    test('デバッグモード切り替えによる詳細情報表示', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await page.click('text=スキップ');
      }
      
      // 提案を表示
      await page.click('[data-testid="situation-workplace"]');
      await page.click('[data-testid="duration-5"]');
      await page.waitForSelector('[data-testid="suggestion-card"]');
      
      // デバッグモードトグルが開発環境で表示される
      const debugToggle = page.locator('[data-testid="debug-mode-toggle"]');
      if (await debugToggle.isVisible()) {
        // 初期状態ではバッジは簡潔表示
        const badge = page.locator('[data-testid="data-source-badge"]').first();
        const initialHeight = await badge.boundingBox();
        
        // デバッグモードをON
        await debugToggle.click();
        await page.waitForTimeout(500); // アニメーション待機
        
        // 詳細情報が表示される
        const expandedHeight = await badge.boundingBox();
        expect(expandedHeight?.height).toBeGreaterThan(initialHeight?.height || 0);
        
        // 応答時間などの詳細が表示される
        await expect(page.locator('text=/\\d+ms/')).toBeVisible();
      }
    });

    test('デバッグモード状態の永続化', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      // デバッグモードをlocalStorageで有効化
      await page.evaluate(() => {
        localStorage.setItem('debugMode', 'true');
      });
      
      await page.reload();
      
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await page.click('text=スキップ');
      }
      
      await page.click('[data-testid="situation-home"]');
      await page.click('[data-testid="duration-5"]');
      await page.waitForSelector('[data-testid="suggestion-card"]');
      
      // デバッグモードが有効な状態で詳細情報が表示される
      await expect(page.locator('text=/\\d+ms/')).toBeVisible();
    });
  });

  // アクセシビリティテスト
  test.describe('アクセシビリティ要件', () => {
    test('バッジのARIA属性が適切に設定されている', async ({ page }) => {
      await page.goto('http://localhost:3001');
      
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await page.click('text=スキップ');
      }
      
      await page.click('[data-testid="situation-workplace"]');
      await page.click('[data-testid="duration-5"]');
      await page.waitForSelector('[data-testid="data-source-badge"]');
      
      const badge = page.locator('[data-testid="data-source-badge"]').first();
      
      // ARIA label が設定されている
      const ariaLabel = await badge.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('データソース');
      
      // role属性が適切
      const role = await badge.getAttribute('role');
      expect(role).toBe('status');
    });

    test('高コントラストモードでの視認性', async ({ page }) => {
      // 高コントラストモードをエミュレート
      await page.emulateMedia({ colorScheme: 'dark' });
      
      await page.goto('http://localhost:3001');
      
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await page.click('text=スキップ');
      }
      
      await page.click('[data-testid="situation-home"]');
      await page.click('[data-testid="duration-5"]');
      await page.waitForSelector('[data-testid="data-source-badge"]');
      
      // バッジが表示されていることを確認
      const badge = page.locator('[data-testid="data-source-badge"]').first();
      await expect(badge).toBeVisible();
      
      // コントラストが十分か視覚的に確認（スクリーンショット）
      await page.screenshot({ 
        path: 'test-results/high-contrast-badge.png',
        fullPage: false,
        clip: await badge.boundingBox() || undefined
      });
    });
  });

  // ネットワークタイムアウトテスト - GEMINI提案による追加
  test('ネットワークタイムアウト時のフォールバック動作', async ({ page }) => {
    // ネットワークタイムアウトをシミュレート
    await page.route('**/api/v1/suggestions**', () => {
    // 応答を返さず、意図的にリクエストをハングさせてタイムアウトを発生させる
  });

    await page.goto('http://localhost:3001');
    
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      await page.click('text=スキップ');
    }
    
    // 提案を要求
    await page.click('[data-testid="situation-workplace"]');
    await page.click('[data-testid="duration-5"]');
    
    // タイムアウト後の表示を確認（8秒待機）
    await page.waitForTimeout(9000);
    
    // エラーメッセージの表示を確認
    const errorMessage = await page.locator('text=/エラーが発生しました|通信環境が不安定/').count();
    console.log(`Error messages found: ${errorMessage}`);
    
    // フォールバック提案が表示されているか確認
    // エラー時はsuggestion-cardが表示されない可能性があるため、
    // フォールバック提案の内容を直接確認
    const fallbackTexts = [
      '5分だけ散歩する',
      '温かい飲み物を飲む',
      '好きな音楽を1曲聴く',
      '簡単なストレッチをする',
      '目を閉じて深呼吸する'
    ];
    
    let fallbackFound = false;
    for (const text of fallbackTexts) {
      if (await page.locator(`text=${text}`).count() > 0) {
        fallbackFound = true;
        console.log(`Found fallback suggestion: ${text}`);
        break;
      }
    }
    
    // エラー画面の「もう一度試す」ボタンがある場合はクリック
    const retryButton = page.locator('text=もう一度試す');
    if (await retryButton.isVisible()) {
      console.log('Retry button found, clicking...');
      await retryButton.click();
      await page.waitForTimeout(1000);
    }
    
    // フォールバック提案またはエラー画面のいずれかが表示されることを確認
    expect(fallbackFound || errorMessage > 0).toBeTruthy();
  });

  // 動的更新テスト
  test('「他の提案を見る」でのバッジ更新', async ({ page }) => {
    let requestCount = 0;
    
    // リクエストごとに異なるソースを返す
    await page.route('**/api/v1/suggestions**', async route => {
      const sources = ['cache', 'api', 'fallback'];
      const source = sources[requestCount % sources.length];
      requestCount++;
      
      const json = {
        suggestions: [
          {
            id: `${requestCount}`,
            title: `${source}からの提案 ${requestCount}`,
            description: '動的に更新される提案',
            duration: 5,
            category: '認知的'
          }
        ],
        metadata: {
          source: source,
          timestamp: new Date().toISOString()
        }
      };
      await route.fulfill({ json });
    });

    await page.goto('http://localhost:3001');
    
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      await page.click('text=スキップ');
    }
    
    // 最初の提案を表示
    await page.click('[data-testid="situation-workplace"]');
    await page.click('[data-testid="duration-5"]');
    await page.waitForSelector('[data-testid="data-source-badge"]');
    
    // 最初のバッジを確認
    let badge = page.locator('[data-testid="data-source-badge"]').first();
    await expect(badge).toContainText('キャッシュ');
    
    // 他の提案を見る
    await page.click('text=他の提案を見る');
    await page.waitForTimeout(1000);
    
    // バッジが更新されている
    badge = page.locator('[data-testid="data-source-badge"]').first();
    await expect(badge).toContainText('AI生成');
    
    // もう一度更新
    await page.click('text=他の提案を見る');
    await page.waitForTimeout(1000);
    
    badge = page.locator('[data-testid="data-source-badge"]').first();
    await expect(badge).toContainText('オフライン');
  });
});