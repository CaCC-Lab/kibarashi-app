/**
 * Supabase + localStorage 同期ストレージ
 *
 * 戦略:
 * - localStorage が正本（マスター）
 * - Supabase はバックアップ/同期先
 * - 同期失敗しても localStorage にデータは残る
 * - 読み取りは localStorage から即座に返す
 */
import { getSupabase, isSupabaseConfigured } from './client';

const USER_ID_KEY = 'kibarashi_user_id';

function getUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

// --- お気に入り ---

export async function syncFavoritesToSupabase(favorites: Array<{
  id: string;
  suggestionId: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  steps?: string[];
  addedAt: string;
}>): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = getUserId();

  try {
    // まず INSERT を準備してから DELETE する（データ消失リスク軽減）
    const rows = favorites.map(f => ({
      user_id: userId,
      title: f.title,
      description: f.description,
      duration: f.duration,
      category: f.category,
      steps: f.steps || [],
      is_favorite: true,
      created_at: f.addedAt,
    }));

    // DELETE + INSERT（localStorage が正本なので、失敗しても次回同期で復元）
    const { error: deleteError } = await supabase
      .from('user_saved_suggestions')
      .delete()
      .eq('user_id', userId)
      .eq('is_favorite', true);

    if (deleteError) {
      console.warn('Supabase sync: delete failed', deleteError.message);
      return; // DELETE 失敗時は INSERT しない（既存データを維持）
    }

    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from('user_saved_suggestions')
        .insert(rows);

      if (insertError) {
        console.warn('Supabase sync: insert failed', insertError.message);
      }
    }
  } catch (e) {
    console.warn('Supabase favorites sync error', e instanceof Error ? e.message : e);
  }
}

export async function loadFavoritesFromSupabase(): Promise<Array<{
  id: string;
  suggestionId: string;
  title: string;
  description: string;
  category: '認知的' | '行動的';
  duration: number;
  steps?: string[];
  addedAt: string;
}> | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_saved_suggestions')
      .select('id, title, description, duration, category, steps, created_at')
      .eq('user_id', getUserId())
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map(row => ({
      id: row.id,
      suggestionId: row.id,
      title: row.title,
      description: row.description,
      category: String(row.category) as '認知的' | '行動的',
      duration: row.duration,
      steps: row.steps || undefined,
      addedAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

// --- 履歴 ---

export async function syncHistoryToSupabase(history: Array<{
  id: string;
  suggestionId: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  steps?: string[];
  completed: boolean;
  rating?: number;
  note?: string;
  startedAt: string;
}>): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = getUserId();
  // 最新100件のみ同期（パフォーマンス制限）
  const recentHistory = history.slice(0, 100);

  try {
    const rows = recentHistory.map(h => ({
      user_id: userId,
      title: h.title,
      description: h.description,
      duration: h.duration,
      category: h.category,
      steps: h.steps || [],
      is_favorite: false,
      rating: h.rating || null,
      memo: h.note || null,
      use_count: h.completed ? 1 : 0,
      last_used_at: h.startedAt,
      created_at: h.startedAt,
    }));

    const { error: deleteError } = await supabase
      .from('user_saved_suggestions')
      .delete()
      .eq('user_id', userId)
      .eq('is_favorite', false);

    if (deleteError) {
      console.warn('Supabase sync: history delete failed', deleteError.message);
      return;
    }

    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from('user_saved_suggestions')
        .insert(rows);

      if (insertError) {
        console.warn('Supabase sync: history insert failed', insertError.message);
      }
    }
  } catch (e) {
    console.warn('Supabase history sync error', e instanceof Error ? e.message : e);
  }
}

export async function loadHistoryFromSupabase(): Promise<Array<{
  id: string;
  suggestionId: string;
  title: string;
  description: string;
  category: '認知的' | '行動的';
  duration: number;
  completed: boolean;
  rating?: number;
  note?: string;
  startedAt: string;
}> | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_saved_suggestions')
      .select('id, title, description, duration, category, use_count, rating, memo, created_at')
      .eq('user_id', getUserId())
      .eq('is_favorite', false)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return null;

    return data.map(row => ({
      id: row.id,
      suggestionId: row.id,
      title: row.title,
      description: row.description,
      category: String(row.category) as '認知的' | '行動的',
      duration: row.duration,
      completed: (row.use_count || 0) > 0,
      rating: row.rating || undefined,
      note: row.memo || undefined,
      startedAt: row.created_at,
    }));
  } catch {
    return null;
  }
}
