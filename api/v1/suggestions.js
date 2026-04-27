// Ollama API統合版 - 動的な提案生成（gemini.js の代替）

const { OllamaClient } = require('./_lib/ollama.js');
const { getDbSuggestions } = require('./_lib/dbSuggestions.js');
const { getFallbackSuggestions } = require('./_lib/fallback.js');
const { getCache } = require('./_lib/cache.js');
const { buildAxes, buildAxisKey } = require('./_lib/contextAxes.js');

let ollamaClient = null;
let lastClientRefresh = 0;
const cache = getCache();

// 遅延初期化（コールドスタート対策）
function getOllamaClient() {
  if (!ollamaClient || Date.now() - lastClientRefresh > 60000) {
    // 1分ごとに再評価
    try {
      ollamaClient = new OllamaClient();
      lastClientRefresh = Date.now();
      console.log('[SUGGESTIONS] Ollama client initialized/refreshed');
    } catch (error) {
      console.error('[SUGGESTIONS] Failed to initialize Ollama client:', error.message);
    }
  }
  return ollamaClient;
}

module.exports = async (req, res) => {
  console.log('[SUGGESTIONS] Function invoked at:', new Date().toISOString());
  console.log('[SUGGESTIONS] Method:', req.method);
  // mood はプライバシーに関わるため、ログでは存在のみ示す（値は残さない）
  {
    const { mood: _mood, ...safeQuery } = req.query;
    console.log('[SUGGESTIONS] Query params:', { ...safeQuery, mood: _mood ? '[redacted]' : undefined });
  }
  
  // 環境変数の確認（デバッグ用）
  const hasOllamaUrl = !!process.env.OLLAMA_BASE_URL;
  console.log('[SUGGESTIONS] Environment check - OLLAMA_BASE_URL:', hasOllamaUrl ? 'SET' : 'NOT SET');
  
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log('[SUGGESTIONS] OPTIONS request, returning 200');
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    console.log('[SUGGESTIONS] Invalid method:', req.method);
    return res.status(405).json({
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }

  try {
    console.log('[SUGGESTIONS] Processing request...');
    
    // パラメータの取得と検証
    const {
      situation = 'workplace',
      duration = '5',
      ageGroup = 'office_worker',
      skipCache = 'false',
      // 自動軸（フロントから計算済みの値が渡る。空なら未指定扱い）
      season,
      weather,
      temperatureBand,
      partOfDay,
      dayType,
      mood,
      intent,
      seasonalEvent,
      // Phase 5: ユーザー入力軸（HomeState 4問アンケート）
      energyLevel,
      socialContext,
      timePressure,
    } = req.query;
    
    const durationNum = parseInt(duration);

    // 有効な値の検証（フロントエンドの types/situation.tsx / types/ageGroup.ts と揃える）
    const validSituations = ['workplace', 'home', 'outside', 'job_hunting', 'studying', 'school', 'commuting'];
    const validDurations = [5, 15, 30];
    const validAgeGroups = ['office_worker', 'student', 'middle_school', 'housewife', 'elderly', 'job_seeker', 'career_changer'];

    const normalizedSituation = validSituations.includes(situation) ? situation : 'workplace';
    const normalizedDuration = validDurations.includes(durationNum) ? durationNum : 5;
    const normalizedAgeGroup = validAgeGroups.includes(ageGroup) ? ageGroup : 'office_worker';

    // 自動軸の正規化（v1/v2 共有）— CONTEXT_AXES_ENABLED=false なら {} が返る
    const axes = buildAxes({
      season, weather, temperatureBand, partOfDay, dayType,
      mood, intent, seasonalEvent,
      energyLevel, socialContext, timePressure,
    });
    
    let suggestions = null;
    let source = 'fallback';
    let debugInfo = {};
    
    // キャッシュキーを生成（mood は buildAxisKey 内でハッシュ化されて平文でログに出ない）
    const axisKey = buildAxisKey(axes);
    const cacheKey = cache.generateKey(
      normalizedSituation,
      normalizedDuration,
      axisKey ? `${normalizedAgeGroup}|${axisKey}` : normalizedAgeGroup
    );
    
    // skipCacheフラグをチェック
    const shouldSkipCache = skipCache === 'true' || skipCache === true;
    
    // まずキャッシュをチェック（skipCacheがfalseの場合のみ）
    if (!shouldSkipCache) {
      const cachedSuggestions = cache.get(cacheKey);
      if (cachedSuggestions) {
        console.log('[SUGGESTIONS] Cache hit for key:', cacheKey);
        suggestions = cachedSuggestions;
        source = 'cache';
        debugInfo.cache_hit = true;
      }
    } else {
      console.log('[SUGGESTIONS] Cache skipped by request parameter');
      debugInfo.cache_skipped = true;
    }
    
    // キャッシュミス → DB first で取得を試みる
    if (!suggestions) {
      try {
        console.log('[SUGGESTIONS] Cache miss, trying Supabase DB...');
        const dbResult = await getDbSuggestions(normalizedSituation, normalizedDuration, normalizedAgeGroup, axes);
        if (dbResult && dbResult.length > 0) {
          suggestions = dbResult;
          source = 'database';
          debugInfo.db_hit = true;
          // DBから取得した結果もキャッシュ
          cache.set(cacheKey, suggestions);
          console.log('[SUGGESTIONS] DB suggestions found:', dbResult.length);
        }
      } catch (dbError) {
        console.error('[SUGGESTIONS] DB lookup error:', dbError.message);
        debugInfo.db_error = dbError.message;
      }
    }

    // DB にもない場合、Ollama APIを試行
    if (!suggestions) {
      const client = getOllamaClient();
      if (client) {
        try {
          console.log('[SUGGESTIONS] Cache miss, attempting Ollama API generation...');
          console.log('[SUGGESTIONS] Request parameters:', {
            situation: normalizedSituation,
            duration: normalizedDuration,
            ageGroup: normalizedAgeGroup
          });

          suggestions = await client.generateSuggestions(
            normalizedSituation,
            normalizedDuration,
            normalizedAgeGroup
          );
          source = 'ollama_api';
          debugInfo.ollama_success = true;
          
          // 成功したらキャッシュに保存
          cache.set(cacheKey, suggestions);
          console.log('[SUGGESTIONS] Cached Ollama response for key:', cacheKey);
          
          console.log('[SUGGESTIONS] Ollama API generation successful');
          console.log('[SUGGESTIONS] Generated suggestions count:', suggestions?.length || 0);
        } catch (ollamaError) {
          console.error('[SUGGESTIONS] Ollama API error details:', {
            message: ollamaError.message,
            stack: ollamaError.stack?.substring(0, 500),
            name: ollamaError.name
          });
          debugInfo.ollama_error = ollamaError.message;
        }
      } else {
        console.log('[SUGGESTIONS] Ollama client not available, using fallback');
        debugInfo.ollama_client_available = false;
      }
    }
    
    // フォールバックデータを使用
    if (!suggestions) {
      console.log('[SUGGESTIONS] Using fallback suggestions');
      suggestions = getFallbackSuggestions(
        normalizedSituation,
        normalizedDuration,
        normalizedAgeGroup
      );
      console.log('[SUGGESTIONS] Fallback suggestions generated:', suggestions?.length || 0);
      
      // 追加のランダム化（確実にシャッフルされるように）
      if (suggestions && suggestions.length > 0) {
        suggestions = shuffleArray(suggestions);
        console.log('[SUGGESTIONS] Fallback suggestions shuffled');
      }
    }
    
    // レスポンスの構築
    const response = {
      suggestions: suggestions,
      metadata: {
        situation: normalizedSituation,
        duration: normalizedDuration,
        ageGroup: normalizedAgeGroup,
        location: req.query.location || 'Tokyo',
        timestamp: new Date().toISOString(),
        source: source,
        cache: cache.getStats(),
        debug: debugInfo
      }
    };

    console.log(`[SUGGESTIONS] Sending response (source: ${source}, count: ${suggestions?.length || 0})`);
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('[SUGGESTIONS] Unexpected error:', {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      name: error.name
    });
    
    // エラー時も最低限のフォールバック提案を返す
    try {
      const fallbackSuggestions = shuffleArray(getFallbackSuggestions('workplace', 5, 'office_worker'));
      return res.status(200).json({
        suggestions: fallbackSuggestions,
        metadata: {
          situation: 'workplace',
          duration: 5,
          ageGroup: 'office_worker',
          timestamp: new Date().toISOString(),
          source: 'error_fallback',
          error: true,
          debug: { error_message: error.message }
        }
      });
    } catch (fallbackError) {
      // 完全に失敗した場合のエラーレスポンス
      return res.status(500).json({
        error: {
          message: 'サーバー内部でエラーが発生しました。時間をおいて再試行してください。',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  }
};

// 配列をシャッフルする関数（確実にランダムになるよう改良）
function shuffleArray(array) {
  if (!array || array.length === 0) return array;
  
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // 追加のランダム性を保証するため、現在時刻を使用
  const timeBasedSeed = new Date().getTime();
  return shuffled.sort(() => (Math.sin(timeBasedSeed + Math.random()) * 10000) % 1 - 0.5);
}