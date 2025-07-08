import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[TEST] Function invoked at:', new Date().toISOString());
  
  try {
    return res.status(200).json({
      status: 'success',
      message: 'Basic test endpoint working',
      timestamp: new Date().toISOString(),
      method: req.method,
      query: req.query
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Test endpoint failed',
      error: (error as any)?.message
    });
  }
}