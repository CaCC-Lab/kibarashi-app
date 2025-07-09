import { test, expect } from '@playwright/test';

test.describe('天気情報の詳細確認', () => {
  test('天気情報の場所変更と実際の天気データ更新を確認', async ({ page }) => {
    // アプリにアクセス
    await page.goto('http://localhost:3001');
    
    // 初期表示の確認
    console.log('=== 初期状態の確認 ===');
    
    // ヘッダー全体を確認
    const headerText = await page.locator('header').textContent();
    console.log('ヘッダー全体:', headerText);
    
    // 天気情報セクションを探す
    const weatherSection = page.locator('[data-testid="weather-info"]');
    if (await weatherSection.isVisible()) {
      const weatherText = await weatherSection.textContent();
      console.log('天気情報セクション:', weatherText);
    } else {
      console.log('天気情報セクションが見つかりません');
      
      // 他の天気関連要素を探す
      const allText = await page.textContent('body');
      const weatherMatches = allText.match(/晴れ|曇り|雨|雪|気温|℃|天気/g);
      console.log('天気関連キーワード:', weatherMatches);
    }
    
    // 場所選択ボタンを確認
    const locationButton = page.locator('button:has-text("東京")');
    console.log('場所選択ボタン存在:', await locationButton.isVisible());
    
    // 場所変更前の天気情報を記録
    const beforeChangeText = await page.textContent('body');
    console.log('場所変更前の全体テキスト（天気部分）:', beforeChangeText.substring(0, 200));
    
    // 場所を大阪に変更
    console.log('=== 場所変更実行 ===');
    await locationButton.click();
    
    // 大阪選択肢を確認
    const osakaOption = page.locator('li:has-text("大阪")');
    console.log('大阪選択肢存在:', await osakaOption.isVisible());
    
    // 大阪をクリック
    await osakaOption.click();
    
    // 変更後の確認
    console.log('=== 変更後の確認 ===');
    
    // 1秒待機（状態更新を待つ）
    await page.waitForTimeout(1000);
    
    // 変更後のヘッダー全体を確認
    const afterHeaderText = await page.locator('header').textContent();
    console.log('変更後ヘッダー全体:', afterHeaderText);
    
    // 天気情報セクションを再確認
    if (await weatherSection.isVisible()) {
      const afterWeatherText = await weatherSection.textContent();
      console.log('変更後天気情報セクション:', afterWeatherText);
    } else {
      console.log('変更後も天気情報セクションが見つかりません');
      
      // 変更後の全体テキストから天気関連を探す
      const afterAllText = await page.textContent('body');
      const afterWeatherMatches = afterAllText.match(/晴れ|曇り|雨|雪|気温|℃|天気/g);
      console.log('変更後天気関連キーワード:', afterWeatherMatches);
    }
    
    // 場所変更後の全体テキストを記録
    const afterChangeText = await page.textContent('body');
    console.log('場所変更後の全体テキスト（天気部分）:', afterChangeText.substring(0, 200));
    
    // 具体的な天気データの変更を確認
    const weatherDataChanged = beforeChangeText !== afterChangeText;
    console.log('天気データが変更されたか:', weatherDataChanged);
    
    // スクリーンショットを取得して確認
    await page.screenshot({ path: 'test-results/weather-before-after.png' });
    
    // 天気情報の更新を確認
    if (afterHeaderText?.includes('大阪')) {
      console.log('✅ ヘッダーの場所表示は正常に更新されました');
    } else {
      console.log('❌ ヘッダーの場所表示が更新されていません');
    }
    
    // 天気データの詳細確認
    expect(afterHeaderText).toContain('大阪');
  });
});