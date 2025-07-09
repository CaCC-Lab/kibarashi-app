import { test, expect } from '@playwright/test';

test.describe('アプリケーションフロー確認', () => {
  test('完全なフローで提案を表示し、更新ボタンを確認', async ({ page }) => {
    // アプリケーションを開く
    await page.goto('http://localhost:3004');
    
    // 初期画面のスクリーンショット
    await page.screenshot({ path: 'screenshots/1-initial.png' });
    
    // 場所を選択（職場）
    await page.click('button:has-text("職場")');
    await page.waitForTimeout(1000);
    
    // 時間選択画面のスクリーンショット
    await page.screenshot({ path: 'screenshots/2-after-location.png' });
    
    // 時間を選択（5分）
    const timeButton = page.locator('button').filter({ hasText: /^5分$/ }).first();
    await timeButton.click();
    await page.waitForTimeout(2000);
    
    // 提案画面のスクリーンショット
    await page.screenshot({ path: 'screenshots/3-suggestions.png' });
    
    // 提案が表示されていることを確認
    const suggestions = await page.locator('.bg-white.rounded-lg.shadow-md').count();
    console.log('表示されている提案数:', suggestions);
    
    // 最初の提案内容を取得
    const firstSuggestionTexts = [];
    for (let i = 0; i < suggestions; i++) {
      const text = await page.locator('.bg-white.rounded-lg.shadow-md').nth(i).textContent();
      firstSuggestionTexts.push(text);
    }
    console.log('最初の提案:', firstSuggestionTexts);
    
    // 「他の提案を見る」ボタンが存在することを確認
    const refreshButton = page.locator('button:has-text("他の提案を見る")');
    await expect(refreshButton).toBeVisible();
    
    // ボタンをクリック
    await refreshButton.click();
    await page.waitForTimeout(2000);
    
    // 更新後のスクリーンショット
    await page.screenshot({ path: 'screenshots/4-after-refresh.png' });
    
    // 更新後の提案内容を取得
    const secondSuggestionTexts = [];
    const updatedSuggestions = await page.locator('.bg-white.rounded-lg.shadow-md').count();
    for (let i = 0; i < updatedSuggestions; i++) {
      const text = await page.locator('.bg-white.rounded-lg.shadow-md').nth(i).textContent();
      secondSuggestionTexts.push(text);
    }
    console.log('更新後の提案:', secondSuggestionTexts);
    
    // 提案が変わっているか確認
    const isSame = JSON.stringify(firstSuggestionTexts) === JSON.stringify(secondSuggestionTexts);
    console.log('提案は同じ？:', isSame);
    
    if (isSame) {
      console.error('警告: 提案が更新されていません！');
    }
  });
  
  test('天気情報の確認', async ({ page }) => {
    await page.goto('http://localhost:3004');
    
    // 職場を選択して進む
    await page.click('button:has-text("職場")');
    await page.waitForTimeout(1000);
    
    const timeButton = page.locator('button').filter({ hasText: /^5分$/ }).first();
    await timeButton.click();
    await page.waitForTimeout(2000);
    
    // 天気情報を探す
    const weatherElements = await page.locator('text=/.*°C/').count();
    console.log('天気情報要素数:', weatherElements);
    
    if (weatherElements > 0) {
      const weatherText = await page.locator('text=/.*°C/').first().textContent();
      console.log('天気情報:', weatherText);
      
      // 東京が含まれているか確認
      const hasTokyoWeather = await page.locator('text=/東京.*°C/').count() > 0;
      console.log('東京の天気が表示されている？:', hasTokyoWeather);
    } else {
      console.log('天気情報が見つかりません');
      
      // ページ全体のテキストを確認
      const pageText = await page.textContent('body');
      console.log('ページ内のテキスト（抜粋）:', pageText?.substring(0, 500));
    }
    
    // 場所を変更してみる
    await page.click('button:has-text("戻る")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("家")');
    await page.waitForTimeout(1000);
    
    await page.locator('button').filter({ hasText: /^5分$/ }).first().click();
    await page.waitForTimeout(2000);
    
    // 家での画面スクリーンショット
    await page.screenshot({ path: 'screenshots/5-home-suggestions.png' });
  });
});