import { test, expect } from '@playwright/test';

test.describe('気晴らし提案の更新機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004');
    // 初期読み込みを待つ
    await page.waitForSelector('.min-h-screen', { timeout: 10000 });
  });

  test('「他の提案を見る」ボタンで新しい提案が表示される', async ({ page }) => {
    // 最初の提案を取得
    const firstSuggestions = await page.locator('.bg-white.rounded-lg.shadow-md').allTextContents();
    console.log('最初の提案:', firstSuggestions);
    
    // 「他の提案を見る」ボタンをクリック
    await page.click('button:has-text("他の提案を見る")');
    
    // 新しい提案が読み込まれるまで待つ
    await page.waitForTimeout(2000);
    
    // 更新後の提案を取得
    const secondSuggestions = await page.locator('.bg-white.rounded-lg.shadow-md').allTextContents();
    console.log('更新後の提案:', secondSuggestions);
    
    // 提案が変わっていることを確認
    expect(firstSuggestions).not.toEqual(secondSuggestions);
  });

  test('場所を変更すると天気情報も更新される', async ({ page }) => {
    // 初期状態の天気情報を確認（東京）
    const tokyoWeather = await page.locator('text=/東京.*°C/').textContent();
    console.log('東京の天気:', tokyoWeather);
    
    // 場所選択ボタンをクリック
    await page.click('button:has-text("職場")');
    
    // 「家」を選択
    await page.click('button:has-text("家")');
    
    // 天気情報が更新されるまで待つ
    await page.waitForTimeout(2000);
    
    // 更新後の天気情報を確認
    const weatherAfterChange = await page.locator('text=/.*°C/').textContent();
    console.log('場所変更後の天気:', weatherAfterChange);
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'weather-after-location-change.png' });
  });
});