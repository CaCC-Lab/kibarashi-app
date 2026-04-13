/**
 * Supabase + localStorage 同期ストレージ
 *
 * 戦略:
 * - Supabase 接続時: DB に書き込み + localStorage にもキャッシュ
 * - Supabase 未接続時: localStorage のみ（オフライン対応）
 * - 読み取り: localStorage から即座に返し、バックグラウンドで DB と同期
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

interface FavoriteRow {
  id?: string;
  user_id: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  steps: string[];
  is_favorite: boolean;
  master_id?: string | null;
  created_at?: string;
}

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
    // 既存データを削除して全件入れ直し（シンプルな同期戦略）
    await supabase.from('user_saved_suggestions').delete().eq('user_id', userId).eq('is_favorite', true);

    if (favorites.length === 0) return;

    const rows: FavoriteRow[] = favorites.map(f => ({
      user_id: userId,
      title: f.title,
      description: f.description,
      duration: f.duration,
      category: f.category,
      steps: f.steps || [],
      is_favorite: true,
      created_at: f.addedAt,
    }));

    await supabase.from('user_saved_suggestions').insert(rows);
  } catch {
    // 同期失敗は無視（localStorage にデータは残っている）
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
      .select('*')
      .eq('user_id', getUserId())
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map(row => ({
      id: row.id,
      suggestionId: row.id,
      title: row.title,
      description: row.description,
      category: (row.category === '認知的' ? '認知的' : '行動的') as '認知的' | '行動的',
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

  try {
    await supabase.from('user_saved_suggestions').delete().eq('user_id', userId).eq('is_favorite', false);

    if (history.length === 0) return;

    const rows = history.map(h => ({
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

    await supabase.from('user_saved_suggestions').insert(rows);
  } catch {
    // 同期失敗は無視
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
      .select('*')
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
      category: (row.category === '認知的' ? '認知的' : '行動的') as '認知的' | '行動的',
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
