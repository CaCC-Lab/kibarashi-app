// CLAUDE-GENERATED: APIキー状態ダッシュボード
// システムの健全性を一目で確認

const { SimpleAPIKeyManager } = require('./_lib/apiKeyManager.js');
const { getCache } = require('./_lib/cache.js');

module.exports = async (req, res) => {
  console.log('[DASHBOARD] Called at:', new Date().toISOString());
  
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // HTMLダッシュボードを返す
    const html = generateDashboardHTML();
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('[DASHBOARD] Error:', error);
    res.status(500).json({
      error: 'Dashboard generation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

function generateDashboardHTML() {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>気晴らしレシピ - システムダッシュボード</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 30px;
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card h2 {
            margin-top: 0;
            color: #34495e;
            font-size: 1.2em;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        .metric-label {
            font-weight: 500;
            color: #666;
        }
        .metric-value {
            font-weight: bold;
            font-size: 1.2em;
        }
        .status-good {
            color: #27ae60;
        }
        .status-warning {
            color: #f39c12;
        }
        .status-error {
            color: #e74c3c;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #ecf0f1;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: #3498db;
            transition: width 0.3s ease;
        }
        .key-status {
            margin: 10px 0;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .key-working {
            background: #d4edda;
            border-color: #c3e6cb;
        }
        .key-failed {
            background: #f8d7da;
            border-color: #f5c6cb;
        }
        .refresh-button {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1em;
        }
        .refresh-button:hover {
            background: #2980b9;
        }
        .loading {
            text-align: center;
            color: #999;
        }
        .error-message {
            background: #fee;
            color: #c33;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 気晴らしレシピ システムダッシュボード</h1>
        
        <div class="dashboard-grid">
            <!-- APIキー状態 -->
            <div class="card">
                <h2>🔑 APIキー状態</h2>
                <div id="api-keys" class="loading">読み込み中...</div>
            </div>
            
            <!-- キャッシュ状態 -->
            <div class="card">
                <h2>💾 キャッシュ状態</h2>
                <div id="cache-status" class="loading">読み込み中...</div>
            </div>
            
            <!-- システム統計 -->
            <div class="card">
                <h2>📊 システム統計</h2>
                <div id="system-stats" class="loading">読み込み中...</div>
            </div>
        </div>
        
        <button class="refresh-button" onclick="refreshDashboard()">🔄 更新</button>
        
        <div id="error-container"></div>
    </div>

    <script>
        async function fetchKeyStatus() {
            try {
                const response = await fetch('/api/v1/key-status');
                const data = await response.json();
                
                const container = document.getElementById('api-keys');
                let html = '';
                
                if (data.apiKeyManager) {
                    const status = data.apiKeyManager.status;
                    html += '<div class="metric"><span class="metric-label">総キー数</span><span class="metric-value">' + data.apiKeyManager.totalKeys + '</span></div>';
                    html += '<div class="metric"><span class="metric-label">現在のキー</span><span class="metric-value">#' + (data.apiKeyManager.currentIndex + 1) + '</span></div>';
                    
                    // 各キーの状態
                    if (data.keyTests) {
                        html += '<h3 style="margin-top: 20px; font-size: 1em;">キー詳細:</h3>';
                        data.keyTests.forEach((key, index) => {
                            const statusClass = status.keyStatuses['key' + index] === 'failed' ? 'key-failed' : 'key-working';
                            const statusText = status.keyStatuses['key' + index] === 'failed' ? '❌ 利用不可' : '✅ 利用可能';
                            html += '<div class="key-status ' + statusClass + '">キー #' + (index + 1) + ': ' + statusText + '</div>';
                        });
                    }
                }
                
                container.innerHTML = html;
            } catch (error) {
                document.getElementById('api-keys').innerHTML = '<div class="error-message">データ取得エラー: ' + error.message + '</div>';
            }
        }
        
        async function fetchCacheStatus() {
            try {
                const response = await fetch('/api/v1/cache-status');
                const data = await response.json();
                
                const container = document.getElementById('cache-status');
                let html = '';
                
                if (data.cache) {
                    const stats = data.cache.stats;
                    const efficiency = data.cache.efficiency;
                    
                    // ヒット率
                    const hitRateClass = stats.hitRate > 0.5 ? 'status-good' : stats.hitRate > 0.2 ? 'status-warning' : 'status-error';
                    html += '<div class="metric"><span class="metric-label">ヒット率</span><span class="metric-value ' + hitRateClass + '">' + efficiency.hitRatePercent + '</span></div>';
                    
                    // キャッシュ使用率
                    html += '<div class="metric"><span class="metric-label">使用率</span><span class="metric-value">' + efficiency.cacheUtilization + '</span></div>';
                    html += '<div class="progress-bar"><div class="progress-fill" style="width: ' + efficiency.cacheUtilization + '"></div></div>';
                    
                    // 統計
                    html += '<div class="metric"><span class="metric-label">ヒット数</span><span class="metric-value status-good">' + stats.hits + '</span></div>';
                    html += '<div class="metric"><span class="metric-label">ミス数</span><span class="metric-value">' + stats.misses + '</span></div>';
                    
                    // 推定節約
                    if (data.performance) {
                        html += '<div class="metric"><span class="metric-label">API呼び出し節約</span><span class="metric-value status-good">' + data.performance.estimatedApiCallsSaved + '回</span></div>';
                    }
                }
                
                container.innerHTML = html;
            } catch (error) {
                document.getElementById('cache-status').innerHTML = '<div class="error-message">データ取得エラー: ' + error.message + '</div>';
            }
        }
        
        async function fetchSystemStats() {
            try {
                const response = await fetch('/api/v1/test-gemini');
                const data = await response.json();
                
                const container = document.getElementById('system-stats');
                let html = '';
                
                if (data.summary) {
                    const statusClass = data.summary.workingKeys > 0 ? 'status-good' : 'status-error';
                    html += '<div class="metric"><span class="metric-label">動作中のキー</span><span class="metric-value ' + statusClass + '">' + data.summary.workingKeys + '/' + data.summary.totalKeys + '</span></div>';
                    
                    // システム状態
                    const systemStatus = data.summary.workingKeys === data.summary.totalKeys ? '正常' : 
                                       data.summary.workingKeys > 0 ? '一部制限' : 'フォールバック動作';
                    const systemClass = data.summary.workingKeys === data.summary.totalKeys ? 'status-good' : 
                                      data.summary.workingKeys > 0 ? 'status-warning' : 'status-error';
                    html += '<div class="metric"><span class="metric-label">システム状態</span><span class="metric-value ' + systemClass + '">' + systemStatus + '</span></div>';
                }
                
                // 最終更新時刻
                html += '<div class="metric"><span class="metric-label">最終確認</span><span class="metric-value">' + new Date().toLocaleTimeString('ja-JP') + '</span></div>';
                
                container.innerHTML = html;
            } catch (error) {
                document.getElementById('system-stats').innerHTML = '<div class="error-message">データ取得エラー: ' + error.message + '</div>';
            }
        }
        
        function refreshDashboard() {
            fetchKeyStatus();
            fetchCacheStatus();
            fetchSystemStats();
        }
        
        // 初期読み込み
        refreshDashboard();
        
        // 30秒ごとに自動更新
        setInterval(refreshDashboard, 30000);
    </script>
</body>
</html>
`;
}