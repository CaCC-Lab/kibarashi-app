// CLAUDE-GENERATED: キャッシュ状態確認エンドポイント
// キャッシュの効果とパフォーマンスを可視化

const { getCache } = require('./_lib/cache.js');

module.exports = async (req, res) => {
  console.log('[CACHE-STATUS] Called at:', new Date().toISOString());
  
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const cache = getCache();
    const status = cache.getStatus();
    
    // キャッシュ効率の分析
    const efficiency = {
      hitRate: status.stats.hitRate,
      hitRatePercent: (status.stats.hitRate * 100).toFixed(1) + '%',
      totalRequests: status.stats.hits + status.stats.misses,
      cacheUtilization: (status.stats.size / status.stats.maxSize * 100).toFixed(1) + '%',
      recommendation: getRecommendation(status.stats)
    };
    
    // エントリの詳細情報を整形
    const entriesInfo = status.entries.map(entry => ({
      ...entry,
      ageMinutes: Math.floor(entry.age / 60),
      ttlMinutes: Math.floor(entry.ttl / 60),
      sizeKB: (entry.size / 1024).toFixed(2)
    }));
    
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      cache: {
        stats: status.stats,
        efficiency: efficiency,
        entries: entriesInfo,
        config: {
          ttlHours: 1,
          maxSize: status.stats.maxSize
        }
      },
      performance: {
        estimatedApiCallsSaved: status.stats.hits,
        estimatedCostSavings: calculateCostSavings(status.stats.hits)
      }
    };
    
    console.log('[CACHE-STATUS] Stats:', status.stats);
    res.status(200).json(response);
    
  } catch (error) {
    console.error('[CACHE-STATUS] Error:', error);
    res.status(500).json({
      error: 'Cache status check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

function getRecommendation(stats) {
  const hitRate = stats.hitRate;
  
  if (hitRate > 0.8) {
    return 'Excellent cache performance. System is running efficiently.';
  } else if (hitRate > 0.5) {
    return 'Good cache performance. Consider pre-warming popular combinations.';
  } else if (hitRate > 0.2) {
    return 'Moderate cache performance. May benefit from longer TTL.';
  } else {
    return 'Low cache performance. Consider analyzing usage patterns.';
  }
}

function calculateCostSavings(hits) {
  // Gemini API pricing estimation (hypothetical)
  const estimatedCostPerCall = 0.0001; // $0.0001 per API call
  const savings = hits * estimatedCostPerCall;
  
  return {
    amount: savings.toFixed(4),
    currency: 'USD',
    description: `Estimated savings from ${hits} cached responses`
  };
}