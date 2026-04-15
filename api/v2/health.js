// V2 Health check endpoint - no authentication required

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') return res.status(200).end();

  res.status(200).json({
    status: 'ok',
    version: 'v2',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
    uptime: Math.floor(process.uptime())
  });
};
