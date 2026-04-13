import { logger } from '../../utils/logger';
import { getFallbackSuggestions } from './fallbackData';
import { generateAISuggestions, isAIProviderConfigured, getAIProviderInfo } from '../aiProvider';
import { JobHuntingPromptInput } from './jobHuntingPromptTemplates';
import { findMasterSuggestions, findCachedSuggestions, cacheAISuggestions } from '../supabase/suggestionRepository';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  steps?: string[];
  guide?: string;
  dataSource?: 'db' | 'ai' | 'fallback' | 'cache' | 'error';
  apiKeyIndex?: number;
  responseTime?: number;
}

/**
 * 気晴らし提案を生成（DB first + AI fallback）
 *
 * 優先順位:
 * 1. suggestions_master（DBマスタ）
 * 2. suggestion_generation_cache（AIキャッシュ、24h以内）
 * 3. AI生成（Ollama/Gemini）→ 結果をキャッシュ保存
 * 4. フォールバック（静的データ）
 */
export async function generateSuggestions(
  situation: 'workplace' | 'home' | 'outside' | 'studying' | 'school' | 'commuting' | 'job_hunting',
  duration: number,
  ageGroup?: string,
  studentContext?: { concern?: string; subject?: string },
  jobHuntingContext?: Partial<JobHuntingPromptInput>
): Promise<Suggestion[]> {
  const startTime = Date.now();

  try {
    // ステップ1: DBマスタから検索
    const masterResults = await findMasterSuggestions(situation, duration, ageGroup);
    if (masterResults.length >= 3) {
      logger.info('Serving suggestions from DB master', { count: masterResults.length, situation, duration });
      // ランダムに3件選出（毎回同じにならないように）
      const shuffled = masterResults.sort(() => Math.random() - 0.5).slice(0, 3);
      return shuffled.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        duration: s.duration,
        category: s.category,
        steps: s.steps,
        guide: s.guide || undefined,
        dataSource: 'db' as const,
        responseTime: Date.now() - startTime,
      }));
    }

    // ステップ2: AIキャッシュから検索（24h以内）
    const cached = await findCachedSuggestions(situation, duration, ageGroup);
    if (cached && Array.isArray(cached) && cached.length >= 3) {
      logger.info('Serving suggestions from AI cache', { situation, duration });
      return (cached as Suggestion[]).slice(0, 3).map(s => ({
        ...s,
        dataSource: 'cache' as const,
        responseTime: Date.now() - startTime,
      }));
    }

    // ステップ3: AI生成
    if (isAIProviderConfigured()) {
      const providerInfo = getAIProviderInfo();
      logger.info('Generating suggestions with AI (DB had insufficient results)', {
        ...providerInfo, situation, duration, ageGroup,
        dbResults: masterResults.length,
      });

      const suggestions = await generateAISuggestions(situation, duration, ageGroup, studentContext, jobHuntingContext);
      const responseTime = Date.now() - startTime;

      const result: Suggestion[] = (suggestions as Suggestion[]).slice(0, 3).map(s => ({
        ...s,
        dataSource: 'ai' as const,
        responseTime,
      }));

      // AI結果をキャッシュに保存（非同期、エラーは無視）
      cacheAISuggestions(
        situation, duration, ageGroup, undefined,
        result, providerInfo.provider, providerInfo.model, responseTime
      ).catch(() => {});

      return result;
    }

    // ステップ4: フォールバック
    logger.info('Using fallback suggestions', { situation, duration, reason: 'No DB/AI available' });
    return getFallbackSuggestions(situation, duration, ageGroup).slice(0, 3).map(s => ({
      ...s,
      dataSource: 'fallback' as const,
      responseTime: Date.now() - startTime,
    }));

  } catch (error) {
    logger.error('Error generating suggestions, falling back to static data:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      situation, duration, ageGroup,
    });

    return getFallbackSuggestions(situation, duration, ageGroup).slice(0, 3).map(s => ({
      ...s,
      dataSource: 'error' as const,
      responseTime: Date.now() - startTime,
    }));
  }
}
