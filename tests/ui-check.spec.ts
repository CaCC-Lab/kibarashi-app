import { test, expect } from '@playwright/test';

test.describe('UI Title and Text Wrapping Issues', () => {
  test('Check current app title and text wrapping issues', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the current state
    await page.screenshot({ 
      path: 'screenshots/current-ui-state.png', 
      fullPage: true 
    });
    
    // Check for the title issue
    const headerTitle = await page.locator('h1').first().textContent();
    console.log('Current header title:', headerTitle);
    
    // Check if "5分気晴らし" appears anywhere in the UI
    const titleElements = await page.locator('text="5分気晴らし"').all();
    console.log('Number of "5分気晴らし" text occurrences:', titleElements.length);
    
    // Take a screenshot after selection to see text wrapping
    await page.locator('text=職場').click();
    await page.locator('text=15分').click();
    await page.screenshot({ 
      path: 'screenshots/after-selection.png', 
      fullPage: true 
    });
    
    // Click to get suggestions to see text wrapping issues
    await page.locator('button:has-text("提案を見る")').click();
    await page.waitForTimeout(3000); // Wait for suggestions to load
    
    // Take a screenshot of suggestions showing text wrapping issues
    await page.screenshot({ 
      path: 'screenshots/suggestions-text-wrapping.png', 
      fullPage: true 
    });
    
    // Check for text wrapping issues in suggestion cards
    const suggestionCards = await page.locator('[data-testid="suggestion-card"]').all();
    for (let i = 0; i < suggestionCards.length; i++) {
      const card = suggestionCards[i];
      const title = await card.locator('h3').textContent();
      const description = await card.locator('p').textContent();
      console.log(`Suggestion ${i + 1} title:`, title);
      console.log(`Suggestion ${i + 1} description:`, description);
    }
  });
  
  test('Mobile viewport text wrapping check', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'screenshots/mobile-current-state.png', 
      fullPage: true 
    });
    
    // Check mobile text wrapping
    await page.locator('text=職場').click();
    await page.locator('text=30分').click();
    await page.locator('button:has-text("提案を見る")').click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'screenshots/mobile-text-wrapping.png', 
      fullPage: true 
    });
  });
});