// APIエンドポイントのシミュレーション
const { getFallbackSuggestions } = require('./api/v1/_lib/fallback.js');

function simulateAPI() {
  console.log('=== API エンドポイントのシミュレーション ===\n');
  
  // 模擬リクエスト
  const mockRequests = [
    { situation: 'workplace', duration: '5', ageGroup: 'office_worker' },
    { situation: 'workplace', duration: '5', ageGroup: 'office_worker' },
    { situation: 'workplace', duration: '5', ageGroup: 'office_worker' },
    { situation: 'home', duration: '5', ageGroup: 'office_worker' },
    { situation: 'job_hunting', duration: '5', ageGroup: 'job_hunting' }
  ];
  
  mockRequests.forEach((req, index) => {
    console.log(`リクエスト ${index + 1}: ${req.situation}/${req.duration}分/${req.ageGroup}`);
    
    try {
      const suggestions = getFallbackSuggestions(req.situation, parseInt(req.duration), req.ageGroup);
      console.log('✅ 提案数:', suggestions.length);
      console.log('✅ 提案:', suggestions.map(s => s.title));
      console.log('✅ ID:', suggestions.map(s => s.id));
    } catch (error) {
      console.error('❌ エラー:', error.message);
    }
    console.log('');
  });
}

// 同じパラメータでの連続実行テスト
function testConsecutiveRequests() {
  console.log('=== 同じパラメータでの連続実行テスト ===\n');
  
  for (let i = 0; i < 3; i++) {
    console.log(`実行 ${i + 1}:`);
    const suggestions = getFallbackSuggestions('workplace', 5, 'office_worker');
    console.log('  提案:', suggestions.map(s => s.title));
    console.log('  ID:', suggestions.map(s => s.id));
    console.log('');
  }
}

simulateAPI();
testConsecutiveRequests();