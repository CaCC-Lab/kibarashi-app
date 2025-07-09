import { test, expect } from '@playwright/test';

test.describe('Weather Location Test', () => {
  test('should display location-specific weather information', async ({ page }) => {
    console.log('Starting weather location test...');
    
    // フロントエンドにアクセス
    await page.goto('http://localhost:3001');
    
    // ページがロードされるまで待機
    await page.waitForLoadState('networkidle');
    
    // 職場を選択
    await page.click('[data-testid="situation-workplace"]');
    
    // 5分を選択
    await page.click('[data-testid="duration-5"]');
    
    // 提案リストページにアクセス
    await page.waitForSelector('[data-testid="suggestion-card"]', { timeout: 10000 });
    
    console.log('Reached suggestions page, checking weather info...');
    
    // 天気情報が表示されるまで待機
    await page.waitForSelector('[data-testid="weather-info"]', { timeout: 10000 });
    
    // 初期状態（東京）の天気情報を取得
    const tokyoWeather = await page.textContent('[data-testid="weather-info"]');
    console.log('Tokyo weather:', tokyoWeather);
    
    // 場所変更ボタンをクリック
    await page.click('button[aria-label="場所を変更"]');
    
    // 大阪を選択
    await page.waitForSelector('[data-testid="location-osaka"]', { timeout: 5000 });
    await page.click('[data-testid="location-osaka"]');
    
    // 場所変更の処理を待機
    await page.waitForTimeout(2000);
    
    // 大阪の天気情報を取得
    await page.waitForSelector('[data-testid="weather-info"]', { timeout: 10000 });
    const osakaWeather = await page.textContent('[data-testid="weather-info"]');
    console.log('Osaka weather:', osakaWeather);
    
    // 天気情報に「大阪」が含まれていることを確認
    expect(osakaWeather).toContain('大阪');
    
    // 天気情報が変わったことを確認
    expect(osakaWeather).not.toBe(tokyoWeather);
    
    console.log('Weather location test completed successfully!');
  });
  
  test('should update weather when location changes in header', async ({ page }) => {
    console.log('Starting header location change test...');
    
    // フロントエンドにアクセス
    await page.goto('http://localhost:3001');
    
    // ページがロードされるまで待機
    await page.waitForLoadState('networkidle');
    
    // 職場を選択
    await page.click('[data-testid="situation-workplace"]');
    
    // 5分を選択
    await page.click('[data-testid="duration-5"]');
    
    // 提案リストページにアクセス
    await page.waitForSelector('[data-testid="suggestion-card"]', { timeout: 10000 });
    
    // ヘッダーの場所表示を確認
    const headerLocation = await page.textContent('button[aria-label="場所を変更"]');
    console.log('Header location:', headerLocation);
    
    // 初期状態は「東京」であることを確認
    expect(headerLocation).toContain('東京');
    
    // 場所変更ボタンをクリック
    await page.click('button[aria-label="場所を変更"]');
    
    // 大阪を選択
    await page.waitForSelector('[data-testid="location-osaka"]', { timeout: 5000 });
    await page.click('[data-testid="location-osaka"]');
    
    // 場所変更の処理を待機
    await page.waitForTimeout(2000);
    
    // ヘッダーの場所表示が更新されたことを確認
    const updatedHeaderLocation = await page.textContent('button[aria-label="場所を変更"]');
    console.log('Updated header location:', updatedHeaderLocation);
    
    // ヘッダーに「大阪」が表示されることを確認
    expect(updatedHeaderLocation).toContain('大阪');
    
    console.log('Header location change test completed successfully!');
  });
  
  test('should display weather info section when available', async ({ page }) => {
    console.log('Starting weather info display test...');
    
    // フロントエンドにアクセス
    await page.goto('http://localhost:3001');
    
    // ページがロードされるまで待機
    await page.waitForLoadState('networkidle');
    
    // 職場を選択
    await page.click('[data-testid="situation-workplace"]');
    
    // 5分を選択
    await page.click('[data-testid="duration-5"]');
    
    // 提案リストページにアクセス
    await page.waitForSelector('[data-testid="suggestion-card"]', { timeout: 10000 });
    
    // 天気情報セクションが表示されているかチェック
    const weatherSection = await page.locator('[data-testid="weather-info"]');
    
    if (await weatherSection.isVisible()) {
      console.log('Weather info section is visible');
      
      // 天気情報の内容を確認
      const weatherText = await weatherSection.textContent();
      console.log('Weather content:', weatherText);
      
      // 基本的な天気情報が含まれていることを確認
      expect(weatherText).toMatch(/\d+°C/); // 温度
      expect(weatherText).toMatch(/(晴れ|曇り|雨|雪)/); // 天候
      expect(weatherText).toMatch(/(東京|大阪|京都|横浜|名古屋|札幌|福岡|仙台|広島|神戸)/); // 地域
      
    } else {
      console.log('Weather info section is not visible - checking why...');
      
      // ページの内容を確認
      const pageContent = await page.content();
      console.log('Page contains weather-info data-testid:', pageContent.includes('data-testid="weather-info"'));
      
      // ContextDisplay コンポーネントが存在するか確認
      const contextDisplay = await page.locator('.bg-gradient-to-r').first();
      const isContextDisplayVisible = await contextDisplay.isVisible();
      console.log('Context display visible:', isContextDisplayVisible);
      
      if (isContextDisplayVisible) {
        const contextText = await contextDisplay.textContent();
        console.log('Context display content:', contextText);
      }
    }
    
    console.log('Weather info display test completed!');
  });
});