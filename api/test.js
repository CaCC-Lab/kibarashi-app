// テスト用エンドポイント - 環境変数の確認とデバッグ情報
module.exports = async function handler(req, res) {
  console.log('[TEST] API called at:', new Date().toISOString());
  
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 環境変数の確認
    const hasGeminiKeys = !!process.env.GEMINI_API_KEY_1;
    const hasWeatherKey = !!process.env.OPENWEATHER_API_KEY;
    
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        vercelEnv: process.env.VERCEL_ENV || 'unknown',
        hasGeminiKeys,
        hasWeatherKey,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      },
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers
      }
    };
    
    console.log('[TEST] Response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);
    
  } catch (error) {
    console.error('[TEST] Error:', error);
    res.status(500).json({
      error: 'Test endpoint failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};