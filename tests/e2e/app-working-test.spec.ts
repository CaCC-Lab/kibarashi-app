import { test, expect } from '@playwright/test';

test.describe('アプリケーション動作テスト', () => {
  test('正しいフローで提案を表示し、更新機能を検証', async ({ page }) => {
    // APIレスポンスを監視
    const apiResponses = [];
    page.on('response', async (response) => {
      if (response.url().includes('/api/v1/suggestions')) {
        const responseData = {
          url: response.url(),
          status: response.status(),
          body: await response.text().catch(() => 'response body read failed')
        };
        apiResponses.push(responseData);
        console.log('API Response:', responseData);
      }
    });

    // アプリケーションを開く
    await page.goto('http://localhost:3004');
    await page.waitForTimeout(3000);
    
    // 初期画面のスクリーンショット
    await page.screenshot({ path: 'screenshots/test-1-initial.png' });
    console.log('アプリケーションを開きました');

    // 職場ボタンを探す（h3タグ内のテキストでクリック）
    const workplaceButton = page.locator('h3:has-text("職場")');
    await expect(workplaceButton).toBeVisible();
    await workplaceButton.click();
    await page.waitForTimeout(2000);
    
    // 時間選択画面のスクリーンショット
    await page.screenshot({ path: 'screenshots/test-2-duration.png' });
    console.log('職場を選択しました');

    // 5分ボタンを探す（h3タグ内のテキストでクリック）
    const fiveMinButton = page.locator('h3:has-text("5分")');
    await expect(fiveMinButton).toBeVisible();
    await fiveMinButton.click();
    await page.waitForTimeout(4000);
    
    // 提案画面のスクリーンショット
    await page.screenshot({ path: 'screenshots/test-3-suggestions.png' });
    console.log('5分を選択しました');
    
    // 初回APIコール確認
    console.log('初回APIコール数:', apiResponses.length);
    if (apiResponses.length > 0) {
      try {
        const firstResponse = JSON.parse(apiResponses[0].body);
        console.log('初回APIレスポンス:', {
          source: firstResponse.metadata?.source,
          suggestionsCount: firstResponse.suggestions?.length
        });
      } catch (e) {
        console.log('初回APIレスポンスのパースに失敗:', e);
      }
    }

    // 提案カードが表示されているか確認
    const suggestionCards = page.locator('.bg-white.rounded-lg.shadow-md');
    const cardCount = await suggestionCards.count();
    console.log('表示されている提案カード数:', cardCount);
    
    // 各提案のタイトルを取得
    const firstSuggestionTitles = [];
    for (let i = 0; i < cardCount; i++) {
      const card = suggestionCards.nth(i);
      const titleElement = card.locator('h3').first();
      const title = await titleElement.textContent();
      firstSuggestionTitles.push(title);
    }
    console.log('最初の提案タイトル:', firstSuggestionTitles);

    // 「他の提案を見る」ボタンを探す
    const refreshButton = page.locator('button:has-text("他の提案を見る")');
    const refreshButtonExists = await refreshButton.count() > 0;
    console.log('「他の提案を見る」ボタンが存在する？:', refreshButtonExists);

    if (refreshButtonExists) {
      // ボタンをクリック
      await refreshButton.click();
      await page.waitForTimeout(4000);
      
      // 更新後のスクリーンショット
      await page.screenshot({ path: 'screenshots/test-4-refreshed.png' });
      
      // 更新後のAPIコール確認
      console.log('更新後のAPIコール数:', apiResponses.length);
      
      // 更新後の提案タイトルを取得
      const updatedCardCount = await suggestionCards.count();
      const secondSuggestionTitles = [];
      for (let i = 0; i < updatedCardCount; i++) {
        const card = suggestionCards.nth(i);
        const titleElement = card.locator('h3').first();
        const title = await titleElement.textContent();
        secondSuggestionTitles.push(title);
      }
      console.log('更新後の提案タイトル:', secondSuggestionTitles);
      
      // 提案が変わったか確認
      const areSame = JSON.stringify(firstSuggestionTitles) === JSON.stringify(secondSuggestionTitles);
      console.log('提案は同じ？:', areSame);
      
      if (areSame) {
        console.error('❌ 警告: 提案が更新されていません！');
      } else {
        console.log('✅ 提案が正常に更新されました');
      }
      
      // APIレスポンスを分析
      if (apiResponses.length >= 2) {
        try {
          const firstData = JSON.parse(apiResponses[0].body);
          const secondData = JSON.parse(apiResponses[1].body);
          
          console.log('APIレスポンス分析:');
          console.log('- 初回ソース:', firstData.metadata?.source);
          console.log('- 更新ソース:', secondData.metadata?.source);
          
          const firstIds = firstData.suggestions?.map(s => s.id) || [];
          const secondIds = secondData.suggestions?.map(s => s.id) || [];
          
          console.log('- 初回提案ID:', firstIds);
          console.log('- 更新提案ID:', secondIds);
          
          const idsAreSame = JSON.stringify(firstIds) === JSON.stringify(secondIds);
          if (idsAreSame) {
            console.error('❌ API レスポンスのIDが同じです！');
          } else {
            console.log('✅ API レスポンスのIDが異なります');
          }
        } catch (e) {
          console.error('APIレスポンス分析エラー:', e);
        }
      }
    } else {
      console.error('❌ 「他の提案を見る」ボタンが見つかりません');
    }
  });
  
  test('場所と天気情報の関係を確認', async ({ page }) => {
    await page.goto('http://localhost:3004');
    await page.waitForTimeout(3000);
    
    // 職場を選択
    await page.locator('h3:has-text("職場")').click();
    await page.waitForTimeout(2000);
    await page.locator('h3:has-text("5分")').click();
    await page.waitForTimeout(3000);
    
    // ヘッダーの天気情報を確認
    const headerElement = page.locator('header');
    const headerText = await headerElement.textContent();
    console.log('ヘッダー全体:', headerText);
    
    // 東京の天気表示を確認
    const tokyoWeatherElement = page.locator('[data-testid="weather-info"]');
    const tokyoWeatherExists = await tokyoWeatherElement.count() > 0;
    
    if (tokyoWeatherExists) {
      const tokyoWeatherText = await tokyoWeatherElement.textContent();
      console.log('東京の天気情報:', tokyoWeatherText);
    } else {
      console.log('天気情報要素が見つかりません');
    }
    
    // 場所選択を変更してテスト
    const locationButton = page.locator('button:has-text("東京")');
    const locationButtonExists = await locationButton.count() > 0;
    
    if (locationButtonExists) {
      await locationButton.click();
      await page.waitForTimeout(2000);
      
      // 大阪を選択
      const osakaOption = page.locator('button:has-text("大阪")');
      const osakaExists = await osakaOption.count() > 0;
      
      if (osakaExists) {
        await osakaOption.click();
        await page.waitForTimeout(3000);
        
        // 変更後の天気情報を確認
        const updatedWeatherText = await headerElement.textContent();
        console.log('場所変更後のヘッダー:', updatedWeatherText);
        
        // スクリーンショット
        await page.screenshot({ path: 'screenshots/test-5-osaka-weather.png' });
        
        // 東京から大阪に変わったか確認
        const hasOsaka = updatedWeatherText?.includes('大阪');
        console.log('大阪の天気が表示されている？:', hasOsaka);
        
        if (!hasOsaka) {
          console.error('❌ 場所を変更しても天気情報が更新されていません');
        } else {
          console.log('✅ 場所変更に応じて天気情報が更新されました');
        }
      } else {
        console.log('大阪選択オプションが見つかりません');
      }
    } else {
      console.log('場所選択ボタンが見つかりません');
    }
  });
});