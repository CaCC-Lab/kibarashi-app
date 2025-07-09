import { test, expect } from '@playwright/test';

test.describe('最終動作確認テスト', () => {
  test('アプリの完全フローと提案更新機能を検証', async ({ page }) => {
    // APIレスポンスを監視
    const apiResponses = [];
    page.on('response', async (response) => {
      if (response.url().includes('/api/v1/suggestions')) {
        console.log('API呼び出し検出:', response.url());
        const responseData = {
          url: response.url(),
          status: response.status(),
          body: await response.text().catch(() => 'failed to read body')
        };
        apiResponses.push(responseData);
      }
    });

    // アプリケーションを開く
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 1. 職場を選択
    console.log('=== ステップ1: 職場選択 ===');
    const workplaceButton = page.locator('button').filter({ hasText: '職場' });
    await expect(workplaceButton).toBeVisible();
    await workplaceButton.click();
    await page.waitForTimeout(2000);
    
    // 2. 5分を選択
    console.log('=== ステップ2: 時間選択 ===');
    const fiveMinButton = page.locator('button[aria-describedby="duration-5-desc"]');
    await expect(fiveMinButton).toBeVisible();
    await fiveMinButton.click();
    await page.waitForTimeout(3000);
    
    // 3. 提案が表示されるまで待つ
    console.log('=== ステップ3: 提案表示確認 ===');
    await page.waitForSelector('.bg-white.rounded-xl.shadow-md', { timeout: 10000 });
    
    // 初期の提案内容を取得
    const suggestionCards = page.locator('.bg-white.rounded-xl.shadow-md');
    const initialCardCount = await suggestionCards.count();
    console.log('初期提案カード数:', initialCardCount);
    
    const initialTitles = [];
    for (let i = 0; i < initialCardCount; i++) {
      const card = suggestionCards.nth(i);
      const title = await card.locator('h3').textContent();
      initialTitles.push(title);
    }
    console.log('初期提案タイトル:', initialTitles);
    
    // 初期スクリーンショット
    await page.screenshot({ path: 'screenshots/final-initial-suggestions.png' });
    
    // 4. 「他の提案を見る」ボタンを探して確認
    console.log('=== ステップ4: 更新ボタン確認 ===');
    const refreshButton = page.locator('button', { hasText: '他の提案を見る' });
    const refreshExists = await refreshButton.count() > 0;
    console.log('更新ボタン存在:', refreshExists);
    
    if (refreshExists) {
      // 初回APIレスポンス確認
      console.log('初回APIコール数:', apiResponses.length);
      
      // 更新ボタンをクリック
      await refreshButton.click();
      await page.waitForTimeout(3000);
      
      // 更新後の提案を取得
      const updatedCardCount = await suggestionCards.count();
      const updatedTitles = [];
      for (let i = 0; i < updatedCardCount; i++) {
        const card = suggestionCards.nth(i);
        const title = await card.locator('h3').textContent();
        updatedTitles.push(title);
      }
      console.log('更新後提案タイトル:', updatedTitles);
      
      // 更新後スクリーンショット
      await page.screenshot({ path: 'screenshots/final-updated-suggestions.png' });
      
      // 5. 提案の変更を確認
      console.log('=== ステップ5: 変更確認 ===');
      const titlesChanged = JSON.stringify(initialTitles) !== JSON.stringify(updatedTitles);
      console.log('タイトルが変更された:', titlesChanged);
      
      // 6. APIレスポンスを分析
      console.log('=== ステップ6: API分析 ===');
      console.log('総APIコール数:', apiResponses.length);
      
      if (apiResponses.length >= 2) {
        try {
          const firstResponse = JSON.parse(apiResponses[0].body);
          const secondResponse = JSON.parse(apiResponses[1].body);
          
          console.log('初回レスポンス分析:');
          console.log('  ソース:', firstResponse.metadata?.source);
          console.log('  提案数:', firstResponse.suggestions?.length);
          console.log('  提案ID:', firstResponse.suggestions?.map(s => s.id));
          
          console.log('更新レスポンス分析:');
          console.log('  ソース:', secondResponse.metadata?.source);
          console.log('  提案数:', secondResponse.suggestions?.length);
          console.log('  提案ID:', secondResponse.suggestions?.map(s => s.id));
          
          // IDが変わっているかチェック
          const firstIds = firstResponse.suggestions?.map(s => s.id) || [];
          const secondIds = secondResponse.suggestions?.map(s => s.id) || [];
          const idsChanged = JSON.stringify(firstIds) !== JSON.stringify(secondIds);
          
          console.log('=== 最終結果 ===');
          console.log('提案タイトル変更:', titlesChanged);
          console.log('提案ID変更:', idsChanged);
          
          if (titlesChanged && idsChanged) {
            console.log('✅ 提案更新機能が正常に動作しています');
          } else {
            console.log('❌ 提案更新機能に問題があります');
            console.log('- タイトル変更:', titlesChanged);
            console.log('- ID変更:', idsChanged);
            
            // 問題の詳細分析
            if (firstResponse.metadata?.source === 'fallback' && secondResponse.metadata?.source === 'fallback') {
              console.log('⚠️ 両方のレスポンスがフォールバックデータです');
            }
            
            if (firstResponse.metadata?.source === 'gemini_api' && secondResponse.metadata?.source === 'gemini_api') {
              console.log('⚠️ GeminiAPIは呼び出されていますが、同じ結果を返しています');
            }
          }
        } catch (parseError) {
          console.error('APIレスポンスの解析エラー:', parseError);
        }
      } else {
        console.log('❌ 更新時のAPIコールが検出されませんでした');
      }
    } else {
      console.log('❌ 「他の提案を見る」ボタンが見つかりません');
    }
  });
  
  test('天気情報の場所連動を確認', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 職場→5分で進む
    await page.locator('button').filter({ hasText: '職場' }).click();
    await page.waitForTimeout(2000);
    await page.locator('button[aria-describedby="duration-5-desc"]').click();
    await page.waitForTimeout(3000);
    
    // 天気情報の確認
    console.log('=== 天気情報確認 ===');
    
    // ヘッダー全体のテキストを確認
    const headerText = await page.locator('header').textContent();
    console.log('ヘッダー全体:', headerText);
    
    // 現在の場所表示を確認
    const currentLocationShown = headerText?.includes('東京');
    console.log('東京が表示されている:', currentLocationShown);
    
    // 場所選択ボタンを探す
    const locationButton = page.locator('button').filter({ hasText: '東京' });
    const locationButtonExists = await locationButton.count() > 0;
    console.log('場所選択ボタン存在:', locationButtonExists);
    
    if (locationButtonExists) {
      await locationButton.click();
      await page.waitForTimeout(2000);
      
      // 大阪を選択
      const osakaButton = page.locator('button').filter({ hasText: '大阪' });
      const osakaExists = await osakaButton.count() > 0;
      console.log('大阪選択肢存在:', osakaExists);
      
      if (osakaExists) {
        await osakaButton.click();
        await page.waitForTimeout(3000);
        
        // 変更後の確認
        const updatedHeaderText = await page.locator('header').textContent();
        console.log('変更後ヘッダー:', updatedHeaderText);
        
        const nowShowsOsaka = updatedHeaderText?.includes('大阪');
        console.log('大阪に変更された:', nowShowsOsaka);
        
        if (nowShowsOsaka) {
          console.log('✅ 場所変更機能が正常に動作しています');
        } else {
          console.log('❌ 場所変更が反映されていません');
        }
      }
    }
  });
});