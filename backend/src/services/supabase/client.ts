import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    logger.warn('Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY missing)');
    return null;
  }

  supabase = createClient(url, key);
  logger.info('Supabase client initialized', { url });
  return supabase;
}
