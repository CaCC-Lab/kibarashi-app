import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[TEST-IMPORT] Function invoked at:', new Date().toISOString());
  
  try {
    console.log('[TEST-IMPORT] Testing core-logic import...');
    const coreLogic = await import("core-logic");
    console.log('[TEST-IMPORT] Core-logic import successful');
    
    return res.status(200).json({
      status: 'success',
      message: 'Core-logic import test successful',
      timestamp: new Date().toISOString(),
      exportedItems: Object.keys(coreLogic)
    });
  } catch (error) {
    console.error('[TEST-IMPORT] Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Core-logic import test failed',
      error: (error as any)?.message,
      stack: (error as any)?.stack
    });
  }
}