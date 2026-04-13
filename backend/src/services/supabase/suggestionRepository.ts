import { getSupabase } from './client';
import { logger } from '../../utils/logger';

export interface MasterSuggestion {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  steps: string[];
  guide: string | null;
  quality_score: number;
  use_count: number;
}

interface CacheEntry {
  id: string;
  suggestions: unknown;
  created_at: string;
}

/**
 * suggestions_master から条件に合う候補を検索
 */
export async function findMasterSuggestions(
  situation: string,
  duration: number,
  ageGroup?: string,
  limit: number = 10
): Promise<MasterSuggestion[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    let query = supabase
      .from('suggestions_master')
      .select('id, title, description, duration, category, steps, guide, quality_score, use_count')
      .eq('duration', duration)
      .eq('is_public', true)
      .contains('situation', [situation])
      .order('quality_score', { ascending: false })
      .order('use_count', { ascending: false })
      .limit(limit);

    if (ageGroup) {
      query = query.contains('age_groups', [ageGroup]);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to query suggestions_master', { error: error.message });
      return [];
    }

    return (data || []) as MasterSuggestion[];
  } catch (error) {
    logger.error('suggestions_master query error', { error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

/**
 * AI生成結果をキャッシュに保存
 */
export async function cacheAISuggestions(
  situation: string,
  duration: number,
  ageGroup: string | undefined,
  weatherCondition: string | undefined,
  suggestions: unknown[],
  aiProvider: string,
  aiModel: string | undefined,
  responseTimeMs: number
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('suggestion_generation_cache').insert({
      input_situation: situation,
      input_duration: duration,
      input_age_group: ageGroup || null,
      input_weather_condition: weatherCondition || null,
      suggestions: JSON.stringify(suggestions),
      ai_provider: aiProvider,
      ai_model: aiModel || null,
      response_time_ms: responseTimeMs,
    });

    logger.info('AI suggestions cached', { situation, duration, count: suggestions.length });
  } catch (error) {
    logger.error('Failed to cache AI suggestions', { error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * キャッシュから最近の提案を検索（同条件で24時間以内）
 */
export async function findCachedSuggestions(
  situation: string,
  duration: number,
  ageGroup?: string
): Promise<unknown[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from('suggestion_generation_cache')
      .select('id, suggestions, created_at')
      .eq('input_situation', situation)
      .eq('input_duration', duration)
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (ageGroup) {
      query = query.eq('input_age_group', ageGroup);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) return null;

    const entry = data[0] as CacheEntry;
    const suggestions = typeof entry.suggestions === 'string'
      ? JSON.parse(entry.suggestions)
      : entry.suggestions;

    if (Array.isArray(suggestions) && suggestions.length > 0) {
      logger.info('Cache hit for suggestions', { situation, duration, cacheId: entry.id });
      return suggestions;
    }

    return null;
  } catch (error) {
    logger.error('Cache lookup error', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * マスタの use_count をインクリメント
 */
export async function incrementUseCount(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.rpc('increment_use_count', { suggestion_id: id }).catch(() => {
      // RPC未定義の場合はraw updateで代替
      return supabase
        .from('suggestions_master')
        .update({ use_count: supabase.rpc ? undefined : 0 }) // fallback
        .eq('id', id);
    });
  } catch {
    // 非クリティカル、無視
  }
}
