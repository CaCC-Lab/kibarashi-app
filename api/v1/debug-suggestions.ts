import { VercelRequest, VercelResponse } from "@vercel/node";

// Debug version of suggestions endpoint
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[DEBUG] Function started at:', new Date().toISOString());
  
  try {
    // Step 1: Basic response
    console.log('[DEBUG] Step 1: Basic response test');
    
    if (req.query.step === '1') {
      return res.status(200).json({
        status: 'success',
        step: 1,
        message: 'Basic response working',
        timestamp: new Date().toISOString()
      });
    }
    
    // Step 2: Test logger import only
    console.log('[DEBUG] Step 2: Testing logger import');
    
    if (req.query.step === '2') {
      const { logger } = await import("core-logic");
      logger.info('Logger import test successful');
      
      return res.status(200).json({
        status: 'success',
        step: 2,
        message: 'Logger import working',
        timestamp: new Date().toISOString()
      });
    }
    
    // Step 3: Test full import
    console.log('[DEBUG] Step 3: Testing full import');
    
    if (req.query.step === '3') {
      const { generateEnhancedSuggestions, logger } = await import("core-logic");
      logger.info('Full import test successful');
      
      return res.status(200).json({
        status: 'success',
        step: 3,
        message: 'Full import working',
        generateEnhancedSuggestions: typeof generateEnhancedSuggestions,
        timestamp: new Date().toISOString()
      });
    }
    
    // Step 4: Test function call with mock data
    console.log('[DEBUG] Step 4: Testing function call');
    
    if (req.query.step === '4') {
      const { generateEnhancedSuggestions, logger } = await import("core-logic");
      logger.info('Testing function call with minimal parameters');
      
      // Call with minimal parameters
      const suggestions = await generateEnhancedSuggestions('studying', 5);
      
      return res.status(200).json({
        status: 'success',
        step: 4,
        message: 'Function call working',
        suggestionCount: suggestions.length,
        timestamp: new Date().toISOString()
      });
    }
    
    // Default: Show available steps
    return res.status(200).json({
      status: 'success',
      message: 'Debug endpoint ready',
      availableSteps: [
        'step=1: Basic response test',
        'step=2: Logger import test', 
        'step=3: Full import test',
        'step=4: Function call test'
      ],
      usage: 'Add ?step=N to test specific functionality',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[DEBUG] Error in step:', req.query.step || 'default');
    console.error('[DEBUG] Error details:', error);
    
    return res.status(500).json({
      status: 'error',
      step: req.query.step || 'default',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}