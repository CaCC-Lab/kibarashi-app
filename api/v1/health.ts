import { VercelRequest, VercelResponse } from '@vercel/node';

// システム健全性チェック
async function checkSystemHealth() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node_version: process.version,
    services: {
      gemini_api: 'unknown',
      google_tts: 'unknown'
    }
  };

  // Gemini API の健全性チェック
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    health.services.gemini_api = geminiKey ? 'configured' : 'not_configured';
  } catch (error) {
    health.services.gemini_api = 'error';
  }

  // Google Cloud TTS の健全性チェック
  try {
    const ttsCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    health.services.google_tts = ttsCredentials ? 'configured' : 'not_configured';
  } catch (error) {
    health.services.google_tts = 'error';
  }

  return health;
}

// メインハンドラー
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }

  try {
    const healthData = await checkSystemHealth();
    
    // サービスの状態に基づいてHTTPステータスを決定
    const hasFailedServices = Object.values(healthData.services).includes('error');
    const statusCode = hasFailedServices ? 503 : 200;

    return res.status(statusCode).json({
      success: !hasFailedServices,
      data: healthData,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        message: 'Health check failed',
        code: 'HEALTH_CHECK_ERROR'
      },
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}