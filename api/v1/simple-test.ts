import { VercelRequest, VercelResponse } from "@vercel/node";

// Simple test function without core-logic import
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[SIMPLE TEST] Function started at:', new Date().toISOString());
  console.log('[SIMPLE TEST] Method:', req.method);
  console.log('[SIMPLE TEST] Query:', req.query);
  
  try {
    console.log('[SIMPLE TEST] Basic logic executing...');
    
    const result = {
      status: 'success',
      message: 'Simple test working correctly',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      query: req.query
    };
    
    console.log('[SIMPLE TEST] Returning result:', result);
    
    return res.status(200).json(result);
    
  } catch (error: any) {
    console.error('[SIMPLE TEST] Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack
    });
  }
}