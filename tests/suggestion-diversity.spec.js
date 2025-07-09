// CLAUDE-GENERATED: 提案の多様性テスト
// Playwrightで実際のAPIを呼び出して多様性を検証

const { test, expect } = require('@playwright/test');

const API_BASE_URL = process.env.API_URL || 'https://kibarashi-app.vercel.app';

test.describe('提案の多様性テスト', () => {
  
  test('同じパラメータでも毎回異なる提案が返される', async ({ request }) => {
    const params = {
      situation: 'workplace',
      duration: '5',
      ageGroup: 'office_worker'
    };
    
    // 5回APIを呼び出す
    const responses = [];
    for (let i = 0; i < 5; i++) {
      const response = await request.get(`${API_BASE_URL}/api/v1/suggestions`, {
        params: params
      });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.suggestions).toHaveLength(3);
      responses.push(data.suggestions);
      
      // 少し待機（キャッシュを避けるため）
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 提案IDのユニーク性を確認
    const allIds = new Set();
    responses.forEach(suggestions => {
      suggestions.forEach(s => {
        allIds.add(s.id);
      });
    });
    
    // 少なくとも5種類以上の異なる提案が含まれていること
    expect(allIds.size).toBeGreaterThanOrEqual(5);
    console.log(`Found ${allIds.size} unique suggestions across 5 requests`);
  });
  
  test('各シチュエーションで適切な提案が返される', async ({ request }) => {
    const situations = ['workplace', 'home', 'outside', 'job_hunting'];
    
    for (const situation of situations) {
      const response = await request.get(`${API_BASE_URL}/api/v1/suggestions`, {
        params: {
          situation: situation,
          duration: '5'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // 提案が3つあること
      expect(data.suggestions).toHaveLength(3);
      
      // 各提案に必要なフィールドがあること
      data.suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('duration');
        expect(suggestion).toHaveProperty('category');
        expect(suggestion).toHaveProperty('steps');
        expect(suggestion.steps).toBeInstanceOf(Array);
        expect(suggestion.steps.length).toBeGreaterThan(0);
      });
      
      console.log(`✓ ${situation}: ${data.suggestions.map(s => s.title).join(', ')}`);
    }
  });
  
  test('時間帯別の提案が適切に変化する', async ({ request }) => {
    const durations = ['5', '15', '30'];
    const titlesPerDuration = {};
    
    for (const duration of durations) {
      const response = await request.get(`${API_BASE_URL}/api/v1/suggestions`, {
        params: {
          situation: 'workplace',
          duration: duration
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // 各時間帯の提案タイトルを記録
      titlesPerDuration[duration] = data.suggestions.map(s => s.title);
      
      // 提案の時間が正しいこと
      data.suggestions.forEach(suggestion => {
        expect(suggestion.duration).toBe(parseInt(duration));
      });
    }
    
    // 時間帯によって異なる提案が含まれること
    const allTitles5 = new Set(titlesPerDuration['5']);
    const allTitles15 = new Set(titlesPerDuration['15']);
    const allTitles30 = new Set(titlesPerDuration['30']);
    
    // 完全に同じではないこと
    expect(allTitles5).not.toEqual(allTitles15);
    expect(allTitles5).not.toEqual(allTitles30);
    expect(allTitles15).not.toEqual(allTitles30);
  });
  
  test('フォールバック提案の多様性確認', async ({ request }) => {
    // key-statusで現在の状態を確認
    const statusResponse = await request.get(`${API_BASE_URL}/api/v1/key-status`);
    const statusData = await statusResponse.json();
    console.log('Current API key status:', statusData.apiKeyManager?.totalKeys || 'unknown');
    
    // 複数回呼び出してフォールバックの多様性を確認
    const fallbackSuggestions = new Set();
    
    for (let i = 0; i < 10; i++) {
      const response = await request.get(`${API_BASE_URL}/api/v1/suggestions`, {
        params: {
          situation: 'workplace',
          duration: '5'
        }
      });
      
      const data = await response.json();
      
      // sourceがfallbackの場合、提案IDを記録
      if (data.metadata.source === 'fallback' || data.metadata.source === 'error_fallback') {
        data.suggestions.forEach(s => {
          fallbackSuggestions.add(s.id);
        });
      }
    }
    
    // フォールバックが使用された場合、多様性を確認
    if (fallbackSuggestions.size > 0) {
      console.log(`Fallback suggestions variety: ${fallbackSuggestions.size} unique suggestions`);
      expect(fallbackSuggestions.size).toBeGreaterThanOrEqual(3);
    }
  });
  
  test('キャッシュが正しく機能していることを確認', async ({ request }) => {
    // キャッシュ状態をクリア（最初のリクエスト）
    const firstResponse = await request.get(`${API_BASE_URL}/api/v1/suggestions`, {
      params: {
        situation: 'home',
        duration: '15',
        ageGroup: 'office_worker'
      }
    });
    
    const firstData = await firstResponse.json();
    const firstSource = firstData.metadata.source;
    
    // 同じパラメータで即座に再リクエスト
    const secondResponse = await request.get(`${API_BASE_URL}/api/v1/suggestions`, {
      params: {
        situation: 'home',
        duration: '15',
        ageGroup: 'office_worker'
      }
    });
    
    const secondData = await secondResponse.json();
    
    // 2回目がキャッシュから返されることを期待
    if (firstSource === 'gemini_api') {
      expect(secondData.metadata.source).toBe('cache');
      console.log('✓ Cache is working correctly');
    }
    
    // キャッシュ統計を確認
    if (secondData.metadata.cache) {
      console.log(`Cache stats - Hits: ${secondData.metadata.cache.hits}, Misses: ${secondData.metadata.cache.misses}, Hit Rate: ${(secondData.metadata.cache.hitRate * 100).toFixed(1)}%`);
    }
  });
});

test.describe('就活・転職活動者向け提案の検証', () => {
  
  test('job_huntingシチュエーションで適切な提案が返される', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/suggestions`, {
      params: {
        situation: 'job_hunting',
        duration: '5',
        ageGroup: 'job_hunting'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // 提案内容が就活・転職活動に関連していることを確認
    const titles = data.suggestions.map(s => s.title);
    const descriptions = data.suggestions.map(s => s.description);
    
    // キーワードチェック
    const jobHuntingKeywords = ['面接', '呼吸', 'ポジティブ', '達成', '緊張', '自信', '成功'];
    const hasRelevantContent = titles.concat(descriptions).some(text => 
      jobHuntingKeywords.some(keyword => text.includes(keyword))
    );
    
    expect(hasRelevantContent).toBeTruthy();
    console.log('Job hunting suggestions:', titles.join(', '));
  });
});