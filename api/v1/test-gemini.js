// Gemini APIの直接テストエンドポイント
const { SimpleAPIKeyManager } = require('./_lib/apiKeyManager.js');
const { GeminiClient } = require('./_lib/gemini.js');

module.exports = async (req, res) => {
  console.log('[TEST-GEMINI] Called at:', new Date().toISOString());
  
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const keyManager = new SimpleAPIKeyManager();
    const geminiClient = new GeminiClient(keyManager);
    
    const testResults = [];
    const totalKeys = keyManager.keys.length;
    
    // 各キーでテスト（簡単なプロンプトで）
    for (let i = 0; i < totalKeys; i++) {
      const currentKey = keyManager.getCurrentKey();
      const maskedKey = currentKey ? 
        `${currentKey.substring(0, 8)}...${currentKey.substring(currentKey.length - 4)}` : 
        'NONE';
      
      try {
        console.log(`[TEST-GEMINI] Testing key ${i + 1}/${totalKeys}`);
        
        // 簡単なテストプロンプト
        const testPrompt = 'Return a JSON array with one item: [{"test": "ok"}]';
        const model = geminiClient.model;
        const result = await model.generateContent(testPrompt);
        const response = await result.response;
        const text = response.text();
        
        testResults.push({
          keyIndex: i,
          maskedKey: maskedKey,
          status: 'success',
          response: text.substring(0, 100)
        });
        
        // 成功したキーをマーク
        keyManager.markSuccess(currentKey);
        
      } catch (error) {
        console.error(`[TEST-GEMINI] Key ${i} failed:`, error.message);
        
        testResults.push({
          keyIndex: i,
          maskedKey: maskedKey,
          status: 'failed',
          error: error.message,
          errorCode: error.code || 'UNKNOWN'
        });
        
        // 失敗したキーをマーク
        keyManager.markFailure(currentKey);
      }
      
      // 次のキーへローテーション（最後のキー以外）
      if (i < totalKeys - 1) {
        keyManager.rotateKey();
        geminiClient.initializeClient();
      }
    }
    
    // 結果の分析
    const workingKeys = testResults.filter(r => r.status === 'success').length;
    const failedKeys = testResults.filter(r => r.status === 'failed').length;
    
    const response = {
      status: workingKeys > 0 ? 'partial' : 'all_failed',
      timestamp: new Date().toISOString(),
      summary: {
        totalKeys: totalKeys,
        workingKeys: workingKeys,
        failedKeys: failedKeys
      },
      testResults: testResults,
      recommendations: []
    };
    
    // 推奨事項
    if (workingKeys === 0) {
      response.recommendations.push('All API keys have reached their quota limit');
      response.recommendations.push('Wait for quota reset or add new API keys');
    } else if (failedKeys > 0) {
      response.recommendations.push(`${failedKeys} keys have reached quota limit`);
      response.recommendations.push('System is using remaining working keys');
    }
    
    console.log('[TEST-GEMINI] Summary:', response.summary);
    res.status(200).json(response);
    
  } catch (error) {
    console.error('[TEST-GEMINI] Error:', error);
    res.status(500).json({
      error: 'Gemini test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};