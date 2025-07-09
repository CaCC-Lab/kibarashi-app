// APIキーの状態を確認するデバッグエンドポイント
const { SimpleAPIKeyManager } = require('./_lib/apiKeyManager.js');
const { GeminiClient } = require('./_lib/gemini.js');

module.exports = async (req, res) => {
  console.log('[KEY-STATUS] Called at:', new Date().toISOString());
  
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // APIキーマネージャーの初期化
    const keyManager = new SimpleAPIKeyManager();
    
    // 環境変数の確認
    const envVars = {};
    for (let i = 1; i <= 5; i++) {
      const key = process.env[`GEMINI_API_KEY_${i}`];
      envVars[`GEMINI_API_KEY_${i}`] = key ? 'SET' : 'NOT_SET';
    }
    
    // 各キーのテスト（実際にAPIを呼ばない軽量なテスト）
    const keyTests = [];
    const totalKeys = keyManager.keys.length;
    
    for (let i = 0; i < totalKeys; i++) {
      try {
        // キーをローテーション
        if (i > 0) keyManager.rotateKey();
        
        const currentKey = keyManager.getCurrentKey();
        const maskedKey = currentKey ? 
          `${currentKey.substring(0, 8)}...${currentKey.substring(currentKey.length - 4)}` : 
          'NONE';
        
        keyTests.push({
          index: i,
          keyIndex: keyManager.currentIndex,
          maskedKey: maskedKey,
          status: 'available'
        });
      } catch (error) {
        keyTests.push({
          index: i,
          error: error.message
        });
      }
    }
    
    // レスポンス
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      apiKeyManager: {
        status: keyManager.getStatus(),
        totalKeys: totalKeys,
        currentIndex: keyManager.currentIndex
      },
      environmentVariables: envVars,
      keyTests: keyTests,
      recommendations: []
    };
    
    // 推奨事項
    if (totalKeys === 0) {
      response.recommendations.push('No API keys found. Please set GEMINI_API_KEY_1');
    } else if (totalKeys === 1) {
      response.recommendations.push('Only 1 API key found. Consider adding GEMINI_API_KEY_2 and GEMINI_API_KEY_3 for better quota management');
    } else if (totalKeys < 3) {
      response.recommendations.push(`${totalKeys} API keys found. Consider adding more keys up to GEMINI_API_KEY_3`);
    }
    
    console.log('[KEY-STATUS] Response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);
    
  } catch (error) {
    console.error('[KEY-STATUS] Error:', error);
    res.status(500).json({
      error: 'Key status check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};