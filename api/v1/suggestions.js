// CLAUDE-GENERATED: Gemini API統合版
// AI-PAIRED: Geminiと協調して動的な提案生成を実現

const { GeminiClient } = require('./_lib/gemini.js');
const { SimpleAPIKeyManager } = require('./_lib/apiKeyManager.js');
const { getFallbackSuggestions } = require('./_lib/fallback.js');

let geminiClient = null;

// 遅延初期化（コールドスタート対策）
function getGeminiClient() {
  if (!geminiClient) {
    try {
      const keyManager = new SimpleAPIKeyManager();
      geminiClient = new GeminiClient(keyManager);
      console.log('[SUGGESTIONS] Gemini client initialized');
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
    
    // Gemini APIを試行
    const client = getGeminiClient();
    if (client) {
      try {
        console.log('[SUGGESTIONS] Attempting Gemini API generation...');
        suggestions = await client.generateSuggestions(
          normalizedSituation, 
          normalizedDuration, 
          ageGroup
        );
        source = 'gemini_api';
        console.log('[SUGGESTIONS] Gemini API generation successful');
      } catch (geminiError) {
        console.error('[SUGGESTIONS] Gemini API error:', geminiError.message);
        // Gemini API失敗時はフォールバックへ
      }
    } else {
      console.log('[SUGGESTIONS] Gemini client not available, using fallback');
    }
    
    // フォールバックデータを使用
    if (!suggestions) {
      console.log('[SUGGESTIONS] Using fallback suggestions');
      suggestions = getFallbackSuggestions(
        normalizedSituation, 
        normalizedDuration, 
        ageGroup
      );
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
        source: source
      }
    };

    console.log(`[SUGGESTIONS] Sending response (source: ${source})`);
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('[SUGGESTIONS] Unexpected error:', error);
    
    // エラー時も最低限のフォールバック提案を返す
    try {
      const fallbackSuggestions = getFallbackSuggestions('workplace', 5, 'office_worker');
      return res.status(200).json({
        suggestions: fallbackSuggestions,
        metadata: {
          situation: 'workplace',
          duration: 5,
          ageGroup: 'office_worker',
          timestamp: new Date().toISOString(),
          source: 'error_fallback',
          error: true
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