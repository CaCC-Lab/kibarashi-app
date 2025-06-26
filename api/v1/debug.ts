import { VercelRequest, VercelResponse } from '@vercel/node';

// デバッグ情報を返すエンドポイント（開発環境のみ）
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
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }

  // 本番環境では無効化
  if (process.env.NODE_ENV === 'production' && !req.query.debug) {
    return res.status(404).json({
      error: {
        message: 'Not found',
        code: 'NOT_FOUND'
      }
    });
  }

  try {
    const debugInfo = {
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        environment: process.env.VERCEL_ENV || 'unknown',
      },
      apiKeys: {
        gemini: {
          configured: !!process.env.GEMINI_API_KEY,
          keyLength: process.env.GEMINI_API_KEY?.length || 0,
          keyPrefix: process.env.GEMINI_API_KEY?.substring(0, 6) + '...' || 'not set'
        },
        googleCloud: {
          configured: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
        }
      },
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      buildInfo: {
        platform: process.platform,
        arch: process.arch,
        tailwindMode: 'jit',
        tailwindVersion: '3.x', // Assuming Tailwind 3.x
        postCSSConfig: 'default'
      }
    };

    return res.status(200).json(debugInfo);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return res.status(500).json({
      error: {
        message: 'Debug info generation failed',
        code: 'DEBUG_ERROR'
      }
    });
  }
}