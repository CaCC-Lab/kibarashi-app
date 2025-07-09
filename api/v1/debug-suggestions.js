// デバッグ用エンドポイント - 提案システムの動作確認
const { getFallbackSuggestions } = require('./_lib/fallback.js');

module.exports = async (req, res) => {
  console.log('[DEBUG] Debug endpoint accessed');
  
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { situation = 'workplace', duration = '5', ageGroup = 'office_worker' } = req.query;
    const durationNum = parseInt(duration);
    
    console.log('[DEBUG] Testing with parameters:', { situation, duration: durationNum, ageGroup });
    
    // 複数回実行してランダム性を確認
    const testResults = [];
    for (let i = 0; i < 5; i++) {
      const suggestions = getFallbackSuggestions(situation, durationNum, ageGroup);
      testResults.push({
        attempt: i + 1,
        suggestions: suggestions.map(s => ({ id: s.id, title: s.title })),
        count: suggestions.length
      });
    }
    
    // 環境変数チェック
    const envCheck = {
      hasGeminiKey1: !!process.env.GEMINI_API_KEY_1,
      hasGeminiKey2: !!process.env.GEMINI_API_KEY_2,
      hasGeminiKey3: !!process.env.GEMINI_API_KEY_3,
      nodeEnv: process.env.NODE_ENV || 'undefined'
    };
    
    const response = {
      debug: true,
      parameters: {
        situation: situation,
        duration: durationNum,
        ageGroup: ageGroup
      },
      environment: envCheck,
      test_results: testResults,
      timestamp: new Date().toISOString()
    };
    
    console.log('[DEBUG] Sending debug response');
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    return res.status(500).json({
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};