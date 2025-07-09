// CLAUDE-GENERATED: Gemini API統合版
// AI-PAIRED: Geminiと協調して動的な提案生成を実現

const { GeminiClient } = require('./_lib/gemini.js');
const { SimpleAPIKeyManager } = require('./_lib/apiKeyManager.js');
const { getFallbackSuggestions } = require('./_lib/fallback.js');
const { getCache } = require('./_lib/cache.js');

let geminiClient = null;
let keyManager = null;
let lastKeyRotation = 0;
const cache = getCache();

// 遅延初期化（コールドスタート対策）
function getGeminiClient() {
  if (!geminiClient || Date.now() - lastKeyRotation > 60000) { // 1分ごとに再評価
    try {
      if (!keyManager) {
        keyManager = new SimpleAPIKeyManager();
      }
      
      // クライアントを再作成（キーの状態が変わっている可能性があるため）
      geminiClient = new GeminiClient(keyManager);
      lastKeyRotation = Date.now();
      console.log('[SUGGESTIONS] Gemini client initialized/refreshed');
    } catch (error) {
      console.error('[SUGGESTIONS] Failed to initialize Gemini client:', error.message);
      // クライアント初期化失敗時はnullのまま
    }
  }
  return geminiClient;
}

module.exports = async (req, res) => {
  console.log('[SUGGESTIONS] Function invoked at:', new Date().toISOString());
  console.log('[SUGGESTIONS] Method:', req.method);
  console.log('[SUGGESTIONS] Query params:', req.query);
  
  // 環境変数の確認（デバッグ用）
  const hasGeminiKey = !!process.env.GEMINI_API_KEY_1;
  console.log('[SUGGESTIONS] Environment check - GEMINI_API_KEY_1:', hasGeminiKey ? 'SET' : 'NOT SET');
  
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
      ageGroup = 'office_worker' 
    } = req.query;
    
    const durationNum = parseInt(duration);
    
    // 有効な値の検証
    const validSituations = ['workplace', 'home', 'outside', 'job_hunting'];
    const validDurations = [5, 15, 30];
    
    const normalizedSituation = validSituations.includes(situation) ? situation : 'workplace';
    const normalizedDuration = validDurations.includes(durationNum) ? durationNum : 5;
    
    let suggestions = null;
    let source = 'fallback';
    let debugInfo = {};
    
    // キャッシュキーを生成
    const cacheKey = cache.generateKey(normalizedSituation, normalizedDuration, ageGroup);
    
    // まずキャッシュをチェック
    const cachedSuggestions = cache.get(cacheKey);
    if (cachedSuggestions) {
      console.log('[SUGGESTIONS] Cache hit for key:', cacheKey);
      suggestions = cachedSuggestions;
      source = 'cache';
      debugInfo.cache_hit = true;
    } else {
      // キャッシュミスの場合、Gemini APIを試行
      const client = getGeminiClient();
      if (client) {
        try {
          console.log('[SUGGESTIONS] Cache miss, attempting Gemini API generation...');
          console.log('[SUGGESTIONS] Request parameters:', {
            situation: normalizedSituation,
            duration: normalizedDuration,
            ageGroup: ageGroup
          });
          
          suggestions = await client.generateSuggestions(
            normalizedSituation, 
            normalizedDuration, 
            ageGroup
          );
          source = 'gemini_api';
          debugInfo.gemini_success = true;
          
          // 成功したらキャッシュに保存
          cache.set(cacheKey, suggestions);
          console.log('[SUGGESTIONS] Cached Gemini response for key:', cacheKey);
          
          console.log('[SUGGESTIONS] Gemini API generation successful');
          console.log('[SUGGESTIONS] Generated suggestions count:', suggestions?.length || 0);
        } catch (geminiError) {
          console.error('[SUGGESTIONS] Gemini API error details:', {
            message: geminiError.message,
            stack: geminiError.stack?.substring(0, 500),
            name: geminiError.name
          });
          debugInfo.gemini_error = geminiError.message;
          // Gemini API失敗時はフォールバックへ
        }
      } else {
        console.log('[SUGGESTIONS] Gemini client not available, using fallback');
        debugInfo.gemini_client_available = false;
      }
    }
    
    // フォールバックデータを使用
    if (!suggestions) {
      console.log('[SUGGESTIONS] Using fallback suggestions');
      suggestions = getFallbackSuggestions(
        normalizedSituation, 
        normalizedDuration, 
        ageGroup
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
        ageGroup: ageGroup,
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