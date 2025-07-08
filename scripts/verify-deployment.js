#!/usr/bin/env node

/**
 * Vercel デプロイメント検証スクリプト
 * 本番環境のAPIエンドポイントが正常に動作しているかを確認
 */

import fetch from 'node-fetch';

const BASE_URL = process.argv[2] || 'https://kibarashi-app.vercel.app';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(endpoint, expectedStatus = 200, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`\n🔍 Testing: ${method} ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Deployment-Verification-Script/1.0'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const startTime = Date.now();
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    
    const statusMatch = response.status === expectedStatus;
    
    if (statusMatch) {
      log('green', `✅ ${response.status} - ${duration}ms`);
      
      // レスポンス内容の確認
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        
        if (endpoint.includes('/health')) {
          if (data.status === 'healthy') {
            log('green', '   Health status: ✅ Healthy');
          } else {
            log('yellow', '   Health status: ⚠️ Not healthy');
          }
        } else if (endpoint.includes('/suggestions')) {
          if (Array.isArray(data.suggestions) && data.suggestions.length === 3) {
            log('green', `   Suggestions: ✅ ${data.suggestions.length} items`);
            
            // 音声ガイドスクリプトの確認
            const hasVoiceGuide = data.suggestions[0].voiceGuideScript;
            if (hasVoiceGuide) {
              log('green', '   Voice Guide: ✅ Available');
            } else {
              log('yellow', '   Voice Guide: ⚠️ Not available');
            }
          } else {
            log('red', '   Suggestions: ❌ Invalid format');
          }
        }
      }
      
      return true;
    } else {
      log('red', `❌ Expected ${expectedStatus}, got ${response.status}`);
      const errorText = await response.text();
      console.log(`   Error: ${errorText.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    log('red', `❌ Request failed: ${error.message}`);
    return false;
  }
}

async function runVerification() {
  log('blue', '🚀 Vercel デプロイメント検証スクリプト開始');
  log('blue', `📍 対象URL: ${BASE_URL}`);
  
  const tests = [
    {
      name: 'Frontend Health Check',
      test: () => testEndpoint('/')
    },
    {
      name: 'API Health Check',
      test: () => testEndpoint('/api/v1/health')
    },
    {
      name: 'Suggestions API - Workplace 5min',
      test: () => testEndpoint('/api/v1/suggestions?situation=workplace&duration=5&ageGroup=office_worker')
    },
    {
      name: 'Suggestions API - Home 15min',
      test: () => testEndpoint('/api/v1/suggestions?situation=home&duration=15&ageGroup=office_worker')
    },
    {
      name: 'Suggestions API - Outside 30min',
      test: () => testEndpoint('/api/v1/suggestions?situation=outside&duration=30&ageGroup=office_worker')
    },
    {
      name: 'TTS API Error Handling',
      test: () => testEndpoint('/api/v1/tts', 500, 'POST', {
        text: 'テストメッセージ',
        voiceConfig: {
          languageCode: 'ja-JP',
          name: 'ja-JP-Neural2-B',
          ssmlGender: 'FEMALE'
        }
      })
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    log('blue', `\n📋 ${test.name}`);
    const result = await test.test();
    if (result) passedTests++;
  }
  
  // 結果サマリー
  console.log('\n' + '='.repeat(60));
  log('blue', '📊 検証結果サマリー');
  console.log('='.repeat(60));
  
  const successRate = (passedTests / totalTests) * 100;
  
  if (passedTests === totalTests) {
    log('green', `✅ 全テスト成功: ${passedTests}/${totalTests} (${successRate}%)`);
    log('green', '🎉 デプロイメントは正常に完了しています！');
  } else {
    log('red', `❌ 一部テスト失敗: ${passedTests}/${totalTests} (${successRate}%)`);
    log('yellow', '⚠️ 失敗したAPIエンドポイントを確認してください');
  }
  
  // 追加情報
  console.log('\n📋 次のステップ:');
  console.log('1. PWAインストール機能をブラウザで確認');
  console.log('2. 各年齢層の提案生成をテスト');
  console.log('3. ダークモード切り替え動作確認');
  console.log('4. レスポンシブデザイン確認（モバイル/タブレット）');
  
  process.exit(passedTests === totalTests ? 0 : 1);
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  runVerification().catch(error => {
    log('red', `💥 検証スクリプトエラー: ${error.message}`);
    process.exit(1);
  });
}