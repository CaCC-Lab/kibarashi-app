// Health check endpoint for debugging
module.exports = async (req, res) => {
  console.log('=== Health Check Called ===');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_VERSION: process.version,
        VERCEL_ENV: process.env.VERCEL_ENV,
        NODE_ENV: process.env.NODE_ENV,
        HAS_GEMINI_KEY: !!process.env.GEMINI_API_KEY_1,
        HAS_WEATHER_KEY: !!process.env.OPENWEATHER_API_KEY
      },
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: req.query
      },
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    console.log('Health check response:', JSON.stringify(response, null, 2));
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};