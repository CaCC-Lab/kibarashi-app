module.exports = (req, res) => {
  console.log('[TEST] Function invoked at:', new Date().toISOString());
  console.log('[TEST] Method:', req.method);
  console.log('[TEST] Query:', req.query);
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    return res.status(200).json({
      success: true,
      message: 'Basic test endpoint working',
      timestamp: new Date().toISOString(),
      query: req.query
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};