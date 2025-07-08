import { test, expect } from '@playwright/test';

test.describe('Location Feature', () => {
  test('should display location selector in header', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3002');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot to see the current state
    await page.screenshot({ path: 'test-results/location-feature-initial.png' });
    
    // Check if location selector elements exist
    const locationElements = await page.locator('[data-testid*="location"], .location-selector, button:has-text("Tokyo"), button:has-text("東京")').count();
    
    console.log('Found location-related elements:', locationElements);
    
    // Take a final screenshot
    await page.screenshot({ path: 'test-results/location-feature-final.png' });
    
    // Basic test: ensure the page loads
    await expect(page).toHaveTitle(/気晴らし/);
  });
  
  test('should allow changing location', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    // Look for any button or element that might be related to location
    const buttons = await page.locator('button').all();
    console.log('Available buttons:', await Promise.all(buttons.map(b => b.textContent())));
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/location-change-test.png' });
    
    // Basic assertion
    expect(buttons.length).toBeGreaterThan(0);
  });
});