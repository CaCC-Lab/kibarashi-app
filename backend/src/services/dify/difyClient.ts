import { logger } from '../../utils/logger';

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'http://localhost:5001';
const DIFY_API_KEY = process.env.DIFY_API_KEY || '';
const DIFY_TIMEOUT = parseInt(process.env.DIFY_TIMEOUT || '120000');

interface DifySuggestion {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  steps?: string[];
  guide?: string;
}

/**
 * Dify completion API にリクエストを送信
 */
async function callDify(
  situation: string,
  duration: number,
  ageGroup: string,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DIFY_TIMEOUT);

  try {
    const response = await fetch(`${DIFY_BASE_URL}/v1/completion-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          situation,
          duration: String(duration),
          age_group: ageGroup,
        },
        response_mode: 'blocking',
        user: 'kibarashi-backend',
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { answer: string };
    return data.answer;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * DifyのレスポンスからJSON配列をパースする
 */
function parseResponse(text: string, duration: number): DifySuggestion[] {
  // Markdownコードブロックを除去
  let jsonText = text;
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1];
  }

  // JSON配列を抽出
  const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No JSON array found in Dify response');
  }

  let cleanJson = jsonMatch[0];
  cleanJson = cleanJson.replace(/,(\s*[}\]])/g, '$1');

  const suggestions = JSON.parse(cleanJson) as Record<string, unknown>[];

  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    throw new Error('Invalid response format from Dify');
  }

  return suggestions.map((s, index) => ({
    id: `dify-${Date.now()}-${index}`,
    title: String(s.title || ''),
    description: String(s.description || ''),
    duration: typeof s.duration === 'number' ? s.duration : duration,
    category: (s.category === '認知的' ? '認知的' : '行動的') as '認知的' | '行動的',
    steps: Array.isArray(s.steps) ? s.steps.map(String) : undefined,
    guide: typeof s.guide === 'string' ? s.guide : undefined,
  }));
}

export const difyClient = {
  async generateSuggestions(
    situation: 'workplace' | 'home' | 'outside' | 'studying' | 'school' | 'commuting' | 'job_hunting',
    duration: number,
    ageGroup?: string,
  ): Promise<DifySuggestion[]> {
    logger.info('Calling Dify API', { situation, duration, ageGroup });

    const text = await callDify(situation, duration, ageGroup || 'office_worker');
    const suggestions = parseResponse(text, duration);

    logger.info('Dify response parsed', { count: suggestions.length });
    return suggestions;
  },

  async generateEnhancedSuggestions(
    situation: string,
    duration: number,
    ageGroup?: string,
  ): Promise<DifySuggestion[]> {
    return this.generateSuggestions(
      situation as 'workplace' | 'home' | 'outside' | 'studying' | 'school' | 'commuting' | 'job_hunting',
      duration,
      ageGroup,
    );
  },
};
