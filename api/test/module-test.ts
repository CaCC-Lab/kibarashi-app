import { VercelRequest, VercelResponse } from "@vercel/node";

// Simple module import test for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Testing module imports...');
    
    // Test basic import
    const { logger } = await import("core-logic");
    console.log('Core-logic import successful');
    
    // Test logger
    logger.info('Logger test in Vercel environment');
    console.log('Logger working');
    
    return res.status(200).json({
      status: 'success',
      message: 'Module imports working correctly',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Module test failed:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack
    });
  }
}