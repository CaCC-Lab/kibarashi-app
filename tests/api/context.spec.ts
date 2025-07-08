import { test, expect } from '@playwright/test';

// Types matching the API response
interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown';
  description: string;
  humidity: number;
  location: string;
  icon: string;
}

interface SeasonalData {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  month: number;
  seasonalEvents: string[];
  holidays: string[];
  specialPeriods: string[];
  seasonalTips: string[];
}

interface ContextualData {
  weather: WeatherData | null;
  seasonal: SeasonalData;
  timestamp: string;
}

interface ApiResponse {
  success: boolean;
  data?: ContextualData;
  error?: {
    message: string;
    code?: string;
  };
}

test.describe('Context API', () => {
  test.describe('/api/v1/context', () => {
    test('should return contextual data with correct structure', async ({ page }) => {
      // Make API request directly
      const response = await page.request.get('/api/v1/context');
      
      // Check response status
      expect(response.status()).toBe(200);
      
      // Check content type
      expect(response.headers()['content-type']).toContain('application/json');
      
      // Parse response body
      const body: ApiResponse = await response.json();
      
      // Validate response structure
      expect(body).toHaveProperty('success', true);
      expect(body).toHaveProperty('data');
      expect(body.data).toBeTruthy();
      
      const data = body.data!;
      
      // Validate contextual data structure
      expect(data).toHaveProperty('weather');
      expect(data).toHaveProperty('seasonal');
      expect(data).toHaveProperty('timestamp');
      
      // Validate timestamp format (ISO string)
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0);
      
      // Validate weather data (can be null)
      if (data.weather) {
        expect(data.weather).toHaveProperty('temperature');
        expect(typeof data.weather.temperature).toBe('number');
        expect(data.weather.temperature).toBeGreaterThan(-50);
        expect(data.weather.temperature).toBeLessThan(50);
        
        expect(data.weather).toHaveProperty('condition');
        expect(['sunny', 'cloudy', 'rainy', 'snowy', 'unknown']).toContain(data.weather.condition);
        
        expect(data.weather).toHaveProperty('description');
        expect(typeof data.weather.description).toBe('string');
        expect(data.weather.description.length).toBeGreaterThan(0);
        
        expect(data.weather).toHaveProperty('humidity');
        expect(typeof data.weather.humidity).toBe('number');
        expect(data.weather.humidity).toBeGreaterThanOrEqual(0);
        expect(data.weather.humidity).toBeLessThanOrEqual(100);
        
        expect(data.weather).toHaveProperty('location');
        expect(typeof data.weather.location).toBe('string');
        expect(data.weather.location.length).toBeGreaterThan(0);
        
        expect(data.weather).toHaveProperty('icon');
        expect(typeof data.weather.icon).toBe('string');
        expect(data.weather.icon.length).toBeGreaterThan(0);
      }
      
      // Validate seasonal data
      expect(data.seasonal).toHaveProperty('season');
      expect(['spring', 'summer', 'autumn', 'winter']).toContain(data.seasonal.season);
      
      expect(data.seasonal).toHaveProperty('month');
      expect(typeof data.seasonal.month).toBe('number');
      expect(data.seasonal.month).toBeGreaterThanOrEqual(1);
      expect(data.seasonal.month).toBeLessThanOrEqual(12);
      
      expect(data.seasonal).toHaveProperty('seasonalEvents');
      expect(Array.isArray(data.seasonal.seasonalEvents)).toBe(true);
      
      expect(data.seasonal).toHaveProperty('holidays');
      expect(Array.isArray(data.seasonal.holidays)).toBe(true);
      
      expect(data.seasonal).toHaveProperty('specialPeriods');
      expect(Array.isArray(data.seasonal.specialPeriods)).toBe(true);
      
      expect(data.seasonal).toHaveProperty('seasonalTips');
      expect(Array.isArray(data.seasonal.seasonalTips)).toBe(true);
      expect(data.seasonal.seasonalTips.length).toBeGreaterThan(0);
    });

    test('should have correct seasonal logic for current month', async ({ page }) => {
      const response = await page.request.get('/api/v1/context');
      expect(response.status()).toBe(200);
      
      const body: ApiResponse = await response.json();
      const data = body.data!;
      
      const currentMonth = new Date().getMonth() + 1;
      
      // Verify that the returned month matches current month
      expect(data.seasonal.month).toBe(currentMonth);
      
      // Verify season based on month
      let expectedSeason: SeasonalData['season'];
      if (currentMonth >= 3 && currentMonth <= 5) {
        expectedSeason = 'spring';
      } else if (currentMonth >= 6 && currentMonth <= 8) {
        expectedSeason = 'summer';
      } else if (currentMonth >= 9 && currentMonth <= 11) {
        expectedSeason = 'autumn';
      } else {
        expectedSeason = 'winter';
      }
      
      expect(data.seasonal.season).toBe(expectedSeason);
    });

    test('should set appropriate cache headers', async ({ page }) => {
      const response = await page.request.get('/api/v1/context');
      
      expect(response.status()).toBe(200);
      expect(response.headers()['cache-control']).toBe('public, max-age=300');
      expect(response.headers()['pragma']).toBe('cache');
    });

    test('should handle CORS properly', async ({ page }) => {
      // Test OPTIONS request
      const optionsResponse = await page.request.fetch('/api/v1/context', {
        method: 'OPTIONS'
      });
      
      expect(optionsResponse.status()).toBe(204);
      expect(optionsResponse.headers()['access-control-allow-origin']).toBe('*');
      expect(optionsResponse.headers()['access-control-allow-methods']).toContain('GET');
      expect(optionsResponse.headers()['access-control-allow-headers']).toContain('Content-Type');
    });

    test('should reject non-GET methods', async ({ page }) => {
      const postResponse = await page.request.post('/api/v1/context');
      expect(postResponse.status()).toBe(405);
      
      const body: ApiResponse = await postResponse.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('METHOD_NOT_ALLOWED');
    });
  });

  test.describe('Integration with frontend', () => {
    test('should work with the actual frontend context API service', async ({ page }) => {
      // Navigate to the frontend
      await page.goto('/');
      
      // Wait for the page to load and check if context data is loaded
      await page.waitForLoadState('networkidle');
      
      // Check network requests for context API call
      const contextRequests = [];
      page.on('request', request => {
        if (request.url().includes('/api/v1/context')) {
          contextRequests.push(request);
        }
      });
      
      // Trigger context data fetch (if not already done)
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Wait a bit for any async context loading
      await page.waitForTimeout(2000);
      
      // Check that no 404 errors occurred for context API
      const responses = await Promise.all(
        contextRequests.map(req => req.response())
      );
      
      for (const response of responses) {
        if (response) {
          expect(response.status()).not.toBe(404);
          if (response.status() === 200) {
            const contentType = response.headers()['content-type'];
            expect(contentType).toContain('application/json');
          }
        }
      }
    });
  });
});