import { test, expect } from '@playwright/test';

// API response types
interface ApiResponse {
  status: 'success' | 'error';
  data?: {
    suggestions: any[];
    metadata: {
      situation: string;
      duration: number;
      location: string;
      timestamp: string;
      ageGroup?: string;
    };
  };
  message?: string;
  code?: string;
}

test.describe('Suggestions API with new parameters', () => {
  test.describe('/api/v1/suggestions', () => {
    test('should handle student ageGroup and Kyoto location', async ({ page }) => {
      // Make API request with new parameters
      const response = await page.request.get('/api/v1/suggestions', {
        params: {
          situation: 'school',
          duration: '5',
          ageGroup: 'student',
          location: 'Kyoto'
        }
      });
      
      // Check response status (should not be 500)
      expect(response.status()).toBe(200);
      
      // Check content type
      expect(response.headers()['content-type']).toContain('application/json');
      
      // Parse response body
      const body: ApiResponse = await response.json();
      
      // Validate response structure
      expect(body).toHaveProperty('status', 'success');
      expect(body).toHaveProperty('data');
      expect(body.data).toBeTruthy();
      
      const data = body.data!;
      
      // Validate suggestions array
      expect(Array.isArray(data.suggestions)).toBe(true);
      expect(data.suggestions.length).toBeGreaterThan(0);
      expect(data.suggestions.length).toBeLessThanOrEqual(3);
      
      // Validate metadata
      expect(data.metadata).toHaveProperty('situation', 'school');
      expect(data.metadata).toHaveProperty('duration', 5);
      expect(data.metadata).toHaveProperty('location', 'Kyoto');
      expect(data.metadata).toHaveProperty('ageGroup', 'student');
      expect(data.metadata).toHaveProperty('timestamp');
      
      // Validate timestamp format
      expect(new Date(data.metadata.timestamp).getTime()).toBeGreaterThan(0);
    });

    test('should handle all new situation types', async ({ page }) => {
      const situations = ['school', 'studying', 'commuting', 'job_hunting'];
      
      for (const situation of situations) {
        const response = await page.request.get('/api/v1/suggestions', {
          params: {
            situation,
            duration: '5'
          }
        });
        
        expect(response.status()).toBe(200);
        
        const body: ApiResponse = await response.json();
        expect(body.status).toBe('success');
        expect(body.data?.suggestions).toBeDefined();
        expect(body.data?.metadata.situation).toBe(situation);
      }
    });

    test('should handle job seeker parameters', async ({ page }) => {
      const response = await page.request.get('/api/v1/suggestions', {
        params: {
          situation: 'job_hunting',
          duration: '15',
          ageGroup: 'job_seeker',
          jobHuntingPhase: 'interviewing',
          jobHuntingConcern: 'nervousness'
        }
      });
      
      expect(response.status()).toBe(200);
      
      const body: ApiResponse = await response.json();
      expect(body.status).toBe('success');
      expect(body.data?.suggestions).toBeDefined();
      expect(body.data?.metadata.ageGroup).toBe('job_seeker');
    });

    test('should handle invalid parameters gracefully', async ({ page }) => {
      const response = await page.request.get('/api/v1/suggestions', {
        params: {
          situation: 'invalid_situation',
          duration: '5'
        }
      });
      
      // Should return 400 Bad Request for invalid input
      expect(response.status()).toBe(400);
      
      const body: ApiResponse = await response.json();
      expect(body.status).toBe('error');
      expect(body.message).toContain('入力データが無効です');
      expect(body.code).toBe('INVALID_INPUT');
    });
  });
});