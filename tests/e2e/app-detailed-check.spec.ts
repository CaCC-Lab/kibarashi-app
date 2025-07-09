import { test, expect } from '@playwright/test';

test.describe('アプリ詳細動作確認', () => {
  test('提案の更新機能を確認', async ({ page }) => {
    // アプリケーションを開く
    await page.goto('http://localhost:3004');
    await page.waitForTimeout(2000);
    
    // 場所を選択（職場）- カード全体をクリック
    await page.locator('.bg-white.rounded-lg').filter({ hasText: '職場' }).click();
    await page.waitForTimeout(2000);
    
    // 時間を選択（5分）- カード全体をクリック
    await page.locator('.bg-white.rounded-lg').filter({ hasText: '5分' }).first().click();
    await page.waitForTimeout(3000);
    
    // 提案画面が表示されているか確認
    const suggestionCards = await page.locator('.bg-white.rounded-lg.shadow-md').all();
    console.log('表示されている提案カード数:', suggestionCards.length);
    
    // 各提案のタイトルを取得
    const firstSuggestionTitles = [];
    for (const card of suggestionCards) {
      // h3タグでタイトルを取得
      const titleElement = await card.locator('h3').first();
      const title = await titleElement.textContent();
      firstSuggestionTitles.push(title);
    }
    console.log('最初の提案タイトル:', firstSuggestionTitles);
    
    // 画面のスクリーンショット
    await page.screenshot({ path: 'screenshots/suggestions-before-refresh.png' });
    
    // 「他の提案を見る」ボタンを探す
    const refreshButton = await page.locator('button').filter({ hasText: '他の提案を見る' });
    const refreshButtonCount = await refreshButton.count();
    console.log('「他の提案を見る」ボタンの数:', refreshButtonCount);
    
    if (refreshButtonCount > 0) {
      // ボタンをクリック
      await refreshButton.click();
      await page.waitForTimeout(3000);
      
      // 更新後のスクリーンショット
      await page.screenshot({ path: 'screenshots/suggestions-after-refresh.png' });
      
      // 更新後の提案タイトルを取得
      const updatedCards = await page.locator('.bg-white.rounded-lg.shadow-md').all();
      const secondSuggestionTitles = [];
      for (const card of updatedCards) {
        const titleElement = await card.locator('h3').first();
        const title = await titleElement.textContent();
        secondSuggestionTitles.push(title);
      }
      console.log('更新後の提案タイトル:', secondSuggestionTitles);
      
      // 提案が変わっているか確認
      const areSame = JSON.stringify(firstSuggestionTitles) === JSON.stringify(secondSuggestionTitles);
      console.log('提案は同じ？:', areSame);
      
      if (areSame) {
        console.error('⚠️ 警告: 提案が更新されていません！');
        console.log('APIレスポンスを確認する必要があります。');
      }
    } else {
      console.error('⚠️ 「他の提案を見る」ボタンが見つかりません');
    }
  });
  
  test('天気情報と場所の関係を確認', async ({ page }) => {
    await page.goto('http://localhost:3004');
    await page.waitForTimeout(2000);
    
    // まず職場を選択
    await page.locator('.bg-white.rounded-lg').filter({ hasText: '職場' }).click();
    await page.waitForTimeout(2000);
    await page.locator('.bg-white.rounded-lg').filter({ hasText: '5分' }).first().click();
    await page.waitForTimeout(3000);
    
    // ヘッダー部分の天気情報を探す
    const headerText = await page.locator('header').textContent();
    console.log('ヘッダーテキスト:', headerText);
    
    // 天気情報がある場合
    const weatherPattern = /([^・]+)・.*?(\d+)°C/;
    const match = headerText?.match(weatherPattern);
    if (match) {
      console.log('現在の場所:', match[1]);
      console.log('現在の温度:', match[2] + '°C');
    } else {
      console.log('天気情報が見つかりません');
    }
    
    // 戻るボタンで場所選択に戻る
    const backButton = await page.locator('button').filter({ hasText: '戻る' });
    if (await backButton.count() > 0) {
      await backButton.click();
      await page.waitForTimeout(2000);
      
      // 今度は「家」を選択
      await page.locator('.bg-white.rounded-lg').filter({ hasText: '家' }).click();
      await page.waitForTimeout(2000);
      await page.locator('.bg-white.rounded-lg').filter({ hasText: '5分' }).first().click();
      await page.waitForTimeout(3000);
      
      // 再度ヘッダーを確認
      const newHeaderText = await page.locator('header').textContent();
      console.log('場所変更後のヘッダー:', newHeaderText);
      
      const newMatch = newHeaderText?.match(weatherPattern);
      if (newMatch) {
        console.log('変更後の場所:', newMatch[1]);
        console.log('変更後の温度:', newMatch[2] + '°C');
      }
      
      // スクリーンショット
      await page.screenshot({ path: 'screenshots/home-location-weather.png' });
    }
  });
  
  test('APIレスポンスを監視', async ({ page }) => {
    // ネットワークリクエストを監視
    const apiResponses = [];
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/v1/suggestions')) {
        const responseData = {
          url: response.url(),
          status: response.status(),
          body: await response.text()
        };
        apiResponses.push(responseData);
        console.log('API Response captured:', responseData);
      }
    });
    
    // アプリを操作
    await page.goto('http://localhost:3004');
    await page.waitForTimeout(2000);
    
    await page.locator('.bg-white.rounded-lg').filter({ hasText: '職場' }).click();
    await page.waitForTimeout(2000);
    await page.locator('.bg-white.rounded-lg').filter({ hasText: '5分' }).first().click();
    await page.waitForTimeout(3000);
    
    console.log('初回APIコール数:', apiResponses.length);
    
    // 「他の提案を見る」をクリック
    const refreshButton = await page.locator('button').filter({ hasText: '他の提案を見る' });
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      await page.waitForTimeout(3000);
      
      console.log('更新後のAPIコール数:', apiResponses.length);
      
      // APIレスポンスを分析
      if (apiResponses.length >= 2) {
        console.log('初回レスポンス:', apiResponses[0]);
        console.log('更新レスポンス:', apiResponses[1]);
        
        try {
          const firstData = JSON.parse(apiResponses[0].body);
          const secondData = JSON.parse(apiResponses[1].body);
          
          console.log('初回のソース:', firstData.metadata?.source);
          console.log('更新のソース:', secondData.metadata?.source);
          
          // 提案が同じかチェック
          const firstTitles = firstData.suggestions.map(s => s.title);
          const secondTitles = secondData.suggestions.map(s => s.title);
          
          console.log('初回の提案タイトル:', firstTitles);
          console.log('更新の提案タイトル:', secondTitles);
          
          const areSame = JSON.stringify(firstTitles) === JSON.stringify(secondTitles);
          if (areSame) {
            console.error('⚠️ APIレスポンスが同じです！');
          }
        } catch (e) {
          console.error('JSONパースエラー:', e);
        }
      }
    }
  });
});