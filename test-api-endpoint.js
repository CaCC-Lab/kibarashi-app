// 実際のAPIエンドポイントのテスト
const suggestionsAPI = require('./api/v1/suggestions.js');

// 模擬リクエスト/レスポンスオブジェクト
function createMockRequest(query = {}) {
  return {
    method: 'GET',
    query: query
  };
}

function createMockResponse() {
  let responseData = null;
  let statusCode = 200;
  
  return {
    setHeader: (name, value) => {
      // CORSヘッダーのモック
    },
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = data;
        },
        end: () => {
          responseData = null;
        }
      };
    },
    getResponse: () => ({ statusCode, data: responseData })
  };
}

async function testAPI() {
  console.log('=== 実際のAPIエンドポイントのテスト ===\n');
  
  const testCases = [
    { situation: 'workplace', duration: '5', ageGroup: 'office_worker' },
    { situation: 'workplace', duration: '5', ageGroup: 'office_worker' },
    { situation: 'workplace', duration: '5', ageGroup: 'office_worker' },
    { situation: 'home', duration: '5', ageGroup: 'office_worker' },
    { situation: 'job_hunting', duration: '5', ageGroup: 'job_hunting' }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const req = createMockRequest(testCase);
    const res = createMockResponse();
    
    console.log(`テスト ${i + 1}: ${testCase.situation}/${testCase.duration}分/${testCase.ageGroup}`);
    
    try {
      await suggestionsAPI(req, res);
      const result = res.getResponse();
      
      if (result.statusCode === 200 && result.data) {
        console.log('✅ ステータス:', result.statusCode);
        console.log('✅ ソース:', result.data.metadata.source);
        console.log('✅ 提案数:', result.data.suggestions.length);
        console.log('✅ 提案タイトル:', result.data.suggestions.map(s => s.title));
        console.log('✅ デバッグ情報:', result.data.metadata.debug);
      } else {
        console.error('❌ エラー:', result);
      }
    } catch (error) {
      console.error('❌ 例外:', error.message);
    }
    console.log('');
  }
}

testAPI();