import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";

// Import core logic from shared package
import { generateEnhancedSuggestions, logger } from "../../packages/core-logic/dist/index.js";

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

// Request validation schema matching backend logic
const suggestionsQuerySchema = z.object({
  situation: z.enum(['workplace', 'home', 'outside', 'studying', 'school', 'commuting', 'job_hunting']),
  duration: z.enum(['5', '15', '30']).transform(Number),
  // Optional parameters for enhanced targeting
  ageGroup: z.enum(['student', 'office_worker', 'middle_school', 'housewife', 'elderly', 'job_seeker', 'career_changer']).optional().catch(undefined),
  studentConcern: z.string().optional(),
  studentSubject: z.string().optional(),
  // Job hunting parameters
  jobHuntingPhase: z.enum(['preparation', 'applying', 'interviewing', 'waiting', 'rejected']).optional(),
  jobHuntingConcern: z.string().optional(),
  jobHuntingDuration: z.enum(['just_started', '1-3months', '3-6months', 'over_6months']).optional(),
});

function handleError(res: VercelResponse, error: unknown): VercelResponse {
  if (error instanceof z.ZodError) {
    logger.warn('Validation error in suggestions API:', error.issues);
    return res.status(400).json({
      status: 'error',
      message: '入力データが無効です。パラメータを確認してください。',
      code: 'INVALID_INPUT',
    } as ApiResponseError);
  }

  logger.error('Unhandled error in suggestions API:', error);
  return res.status(500).json({
    status: 'error',
    message: 'サーバー内部でエラーが発生しました。時間をおいて再試行してください。',
    code: 'INTERNAL_SERVER_ERROR',
  } as ApiResponseError);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    } as ApiResponseError);
  }

  try {
    // Validate request parameters
    const validatedQuery = suggestionsQuerySchema.parse(req.query);
    const { 
      situation, 
      duration, 
      ageGroup, 
      studentConcern, 
      studentSubject,
      jobHuntingPhase,
      jobHuntingConcern,
      jobHuntingDuration 
    } = validatedQuery;

    logger.info(`Generating suggestions for situation: ${situation}, duration: ${duration}, ageGroup: ${ageGroup || 'default'}`);

    // Build context for enhanced suggestions
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

    // Generate suggestions using core logic
    const suggestions = await generateEnhancedSuggestions(situation, duration, ageGroup, studentContext, jobHuntingContext);

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
          timestamp: new Date().toISOString(),
          ...(ageGroup && { ageGroup }),
        },
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    return handleError(res, error);
  }
}