import { VercelRequest, VercelResponse } from "@vercel/node";

// All dependencies now loaded dynamically to avoid startup errors
// import { z } from "zod";
// import { generateEnhancedSuggestions, logger } from "core-logic";

// Standard API response types
type ApiResponseSuccess<T> = {
  status: 'success';
  data: T;
};

type ApiResponseError = {
  status: 'error';
  message: string;
  code?: string;
};

// Request validation schema - will be created dynamically

async function handleError(res: VercelResponse, error: unknown): Promise<VercelResponse> {
  try {
    const { logger } = await import("core-logic");
    
    // Check for validation error dynamically
    if (error && typeof error === 'object' && 'issues' in error) {
      logger.warn('Validation error in suggestions API:', (error as any).issues);
      return res.status(400).json({
        status: 'error',
        message: '入力データが無効です。パラメータを確認してください。',
        code: 'INVALID_INPUT',
      } as ApiResponseError);
    }

    logger.error('Unhandled error in suggestions API:', error);
  } catch (importError) {
    console.error('Failed to import logger for error handling:', importError);
  }
  
  return res.status(500).json({
    status: 'error',
    message: 'サーバー内部でエラーが発生しました。時間をおいて再試行してください。',
    code: 'INTERNAL_SERVER_ERROR',
  } as ApiResponseError);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[HANDLER] Function invoked at:', new Date().toISOString());
  console.log('[HANDLER] Method:', req.method);
  console.log('[HANDLER] Query params:', req.query);
  console.log('[HANDLER] Environment NODE_ENV:', process.env.NODE_ENV);
  console.log('[HANDLER] Environment VERCEL:', process.env.VERCEL);
  console.log('[HANDLER] Environment keys count:', Object.keys(process.env).length);
  
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log('[HANDLER] OPTIONS request, returning 200');
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    console.log('[HANDLER] Invalid method:', req.method);
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    } as ApiResponseError);
  }

  try {
    console.log('[HANDLER] Starting main logic...');
    
    // Quick debug mode for testing
    if (req.query.debug === 'quick') {
      console.log('[HANDLER] Quick debug mode');
      return res.status(200).json({
        status: 'success',
        message: 'Quick debug mode working',
        timestamp: new Date().toISOString(),
        query: req.query
      });
    }
    
    // Import test mode
    if (req.query.debug === 'import') {
      console.log('[HANDLER] Import test mode');
      try {
        console.log('[HANDLER] Testing dynamic import...');
        const { generateEnhancedSuggestions, logger } = await import("core-logic");
        console.log('[HANDLER] Dynamic import successful');
        logger.info('Import test - logger working');
        return res.status(200).json({
          status: 'success',
          message: 'Import test successful',
          generateEnhancedSuggestions: typeof generateEnhancedSuggestions,
          logger: typeof logger,
          timestamp: new Date().toISOString()
        });
      } catch (importError) {
        console.error('[HANDLER] Import test failed:', importError);
        console.error('[HANDLER] Error stack:', (importError as any)?.stack);
        return res.status(500).json({
          status: 'error',
          message: 'Import test failed',
          error: (importError as any).message,
          stack: (importError as any)?.stack,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Validate request parameters with dynamic import
    console.log('[HANDLER] Validating request parameters...');
    const { z } = await import("zod");
    
    const suggestionsQuerySchema = z.object({
      situation: z.enum(['workplace', 'home', 'outside', 'studying', 'school', 'commuting', 'job_hunting']),
      duration: z.enum(['5', '15', '30']).transform(Number),
      // Location parameter for contextual suggestions
      location: z.string().optional().default('Tokyo'),
      // Optional parameters for enhanced targeting
      ageGroup: z.enum(['student', 'office_worker', 'middle_school', 'housewife', 'elderly', 'job_seeker', 'career_changer']).optional().catch(undefined),
      studentConcern: z.string().optional(),
      studentSubject: z.string().optional(),
      // Job hunting parameters
      jobHuntingPhase: z.enum(['preparation', 'applying', 'interviewing', 'waiting', 'rejected']).optional(),
      jobHuntingConcern: z.string().optional(),
      jobHuntingDuration: z.enum(['just_started', '1-3months', '3-6months', 'over_6months']).optional(),
    });
    
    const validatedQuery = suggestionsQuerySchema.parse(req.query);
    console.log('[HANDLER] Validation successful');
    
    const { 
      situation, 
      duration, 
      location,
      ageGroup, 
      studentConcern, 
      studentSubject,
      jobHuntingPhase,
      jobHuntingConcern,
      jobHuntingDuration 
    } = validatedQuery;

    console.log('[HANDLER] Validated params:', { situation, duration, location, ageGroup });
    
    // Dynamic import of core logic functions to avoid startup errors
    console.log('[HANDLER] Importing core logic functions...');
    const { generateEnhancedSuggestions, logger } = await import("core-logic");
    console.log('[HANDLER] Core logic functions imported successfully');
    
    logger.info(`Generating suggestions for situation: ${situation}, duration: ${duration}, location: ${location}, ageGroup: ${ageGroup || 'default'}`);

    // Build context for enhanced suggestions
    console.log('[HANDLER] Building context...');
    const studentContext = (ageGroup === 'student' && (studentConcern || studentSubject)) ? {
      concern: studentConcern,
      subject: studentSubject,
    } : undefined;

    const jobHuntingContext = ((ageGroup === 'job_seeker' || ageGroup === 'career_changer') && 
      (jobHuntingPhase || jobHuntingConcern || jobHuntingDuration)) ? {
      currentPhase: jobHuntingPhase,
      concern: jobHuntingConcern,
      activityDuration: jobHuntingDuration,
    } : undefined;

    console.log('[HANDLER] Context built, calling generateEnhancedSuggestions...');
    
    // Generate suggestions using core logic with location parameter
    const suggestions = await generateEnhancedSuggestions(situation, duration, ageGroup, studentContext, jobHuntingContext, location);
    console.log('[HANDLER] Suggestions generated successfully, count:', suggestions.length);

    // Cache control headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const response: ApiResponseSuccess<{ suggestions: any[]; metadata: any }> = {
      status: 'success',
      data: {
        suggestions,
        metadata: {
          situation,
          duration,
          location,
          timestamp: new Date().toISOString(),
          ...(ageGroup && { ageGroup }),
        },
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[HANDLER] Error caught:', error);
    console.error('[HANDLER] Error type:', typeof error);
    console.error('[HANDLER] Error name:', (error as any)?.name);
    console.error('[HANDLER] Error message:', (error as any)?.message);
    console.error('[HANDLER] Error stack:', (error as any)?.stack);
    return handleError(res, error);
  }
}