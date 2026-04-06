import { logger } from '../../utils/logger';
import {
  generateImprovedPrompt,
  createStudentPrompt,
  createJobSeekerPrompt,
  createCareerChangerPrompt,
  StudentPromptInput,
  JobHuntingPromptInput,
} from 'core-logic';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:26b';
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || '120000');
const MAX_RETRIES = 2;

interface OllamaSuggestion {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  steps?: string[];
  guide?: string;
}

/**
 * Ollama APIにリクエストを送信し、テキストレスポンスを取得
 */
async function callOllama(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          {
            role: 'system',
            content: 'あなたは気晴らし提案の専門家です。回答はJSON配列のみを出力してください。説明文や前置きは不要です。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false,
        options: {
          temperature: 0.8,
          num_predict: 4096,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { message?: { content: string } };
    return data.message?.content || '';
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * LLMレスポンスからJSON配列をパースする
 */
function parseResponse(text: string, duration: number): OllamaSuggestion[] {
  // Markdownコードブロックを除去
  let jsonText = text;
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1];
  }

  // JSONの配列部分を抽出
  const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    // 配列でなくオブジェクトの場合（{ "suggestions": [...] } 形式）
    const objMatch = jsonText.match(/\{[\s\S]*\}/);
    if (objMatch) {
      const obj = JSON.parse(objMatch[0]) as Record<string, unknown>;
      if (Array.isArray(obj.suggestions)) {
        return (obj.suggestions as Record<string, unknown>[]).map((s, index) => ({
          id: `ollama-${Date.now()}-${index}`,
          title: String(s.title || ''),
          description: String(s.description || ''),
          duration: typeof s.duration === 'number' ? s.duration : duration,
          category: (s.category === '認知的' ? '認知的' : '行動的') as '認知的' | '行動的',
          steps: Array.isArray(s.steps) ? s.steps.map(String) : undefined,
          guide: typeof s.guide === 'string' ? s.guide : undefined,
        }));
      }
    }
    throw new Error('No JSON array found in response');
  }

  // 不正なJSONを修正（末尾のカンマを除去）
  let cleanJson = jsonMatch[0];
  cleanJson = cleanJson.replace(/,(\s*[}\]])/g, '$1');

  const suggestions = JSON.parse(cleanJson) as Record<string, unknown>[];

  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    throw new Error('Invalid response format: empty or not an array');
  }

  return suggestions.map((s, index) => ({
    id: `ollama-${Date.now()}-${index}`,
    title: String(s.title || ''),
    description: String(s.description || ''),
    duration: typeof s.duration === 'number' ? s.duration : duration,
    category: (s.category === '認知的' ? '認知的' : '行動的') as '認知的' | '行動的',
    steps: Array.isArray(s.steps) ? s.steps.map(String) : undefined,
    guide: typeof s.guide === 'string' ? s.guide : undefined,
  }));
}

/**
 * プロンプトを生成する（geminiClientのcreatePromptと同じロジック）
 */
function createPrompt(
  situation: string,
  duration: number,
  ageGroup: string = 'office_worker',
  studentContext?: Partial<StudentPromptInput>,
  jobHuntingContext?: Partial<JobHuntingPromptInput>,
): string {
  if (ageGroup === 'student' && studentContext) {
    const studentInput: StudentPromptInput = {
      concern: studentContext.concern || '',
      subject: studentContext.subject || '',
      time: duration,
      situation: (studentContext.situation || 'studying') as 'studying' | 'school' | 'commuting' | 'beforeExam',
      stressFactor: studentContext.stressFactor,
    };
    const situationMap: Record<string, 'studying' | 'school' | 'commuting' | 'beforeExam'> = {
      studying: 'studying', school: 'school', commuting: 'commuting', beforeExam: 'beforeExam',
      workplace: 'studying', home: 'studying', outside: 'school',
    };
    studentInput.situation = situationMap[situation] || 'studying';
    return createStudentPrompt(studentInput);
  }

  if (ageGroup === 'job_seeker' && jobHuntingContext) {
    return createJobSeekerPrompt({
      activityType: 'job_seeking',
      currentPhase: jobHuntingContext.currentPhase,
      concern: jobHuntingContext.concern || '',
      time: duration,
      situation: situation as 'workplace' | 'home' | 'outside',
      stressFactor: jobHuntingContext.stressFactor,
      activityDuration: jobHuntingContext.activityDuration,
    });
  }

  if (ageGroup === 'career_changer' && jobHuntingContext) {
    return createCareerChangerPrompt({
      activityType: 'career_change',
      currentPhase: jobHuntingContext.currentPhase,
      concern: jobHuntingContext.concern || '',
      time: duration,
      situation: situation as 'workplace' | 'home' | 'outside',
      stressFactor: jobHuntingContext.stressFactor,
      activityDuration: jobHuntingContext.activityDuration,
    });
  }

  return generateImprovedPrompt(situation, duration, ageGroup, []);
}

export const ollamaClient = {
  async generateSuggestions(
    situation: 'workplace' | 'home' | 'outside' | 'studying' | 'school' | 'commuting' | 'job_hunting',
    duration: number,
    ageGroup?: string,
    studentContext?: Partial<StudentPromptInput>,
    jobHuntingContext?: Partial<JobHuntingPromptInput>,
  ): Promise<OllamaSuggestion[]> {
    const prompt = createPrompt(situation, duration, ageGroup, studentContext, jobHuntingContext);

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        logger.info('Calling Ollama API', { model: OLLAMA_MODEL, situation, duration, attempt });
        const text = await callOllama(prompt);
        const suggestions = parseResponse(text, duration);
        logger.info('Ollama response parsed', { count: suggestions.length });
        return suggestions;
      } catch (error) {
        lastError = error as Error;
        logger.error(`Ollama API error (attempt ${attempt}/${MAX_RETRIES})`, {
          error: lastError.message,
          situation,
          duration,
        });
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    throw lastError || new Error('All Ollama retry attempts failed');
  },

  async generateEnhancedSuggestions(
    situation: string,
    duration: number,
    ageGroup?: string,
    studentContext?: Partial<StudentPromptInput>,
    jobHuntingContext?: Partial<JobHuntingPromptInput>,
  ): Promise<OllamaSuggestion[]> {
    // Enhanced suggestionsは基本のgenerateSuggestionsと同じプロンプトで生成
    // 音声ガイドへの変換はenhancedGenerator側で行う
    return this.generateSuggestions(
      situation as 'workplace' | 'home' | 'outside' | 'studying' | 'school' | 'commuting' | 'job_hunting',
      duration,
      ageGroup,
      studentContext,
      jobHuntingContext,
    );
  },
};
