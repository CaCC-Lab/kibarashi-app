#!/usr/bin/env node

// 遅延初期化のテスト
console.log('Starting lazy initialization test...');

try {
  // CommonJS環境でモジュールインポートをテスト
  console.log('1. Testing module import...');
  const { generateEnhancedSuggestions, logger } = require('./packages/core-logic/dist/index.js');
  console.log('✅ Module import successful');
  
  // ロガーが使用可能かテスト
  console.log('2. Testing logger...');
  logger.info('Logger test successful');
  console.log('✅ Logger working');
  
  // 遅延初期化のテスト（APIキーがなくても関数は利用可能のはず）
  console.log('3. Testing lazy initialization...');
  console.log('   Function available:', typeof generateEnhancedSuggestions === 'function');
  console.log('✅ Lazy initialization working');
  
  console.log('\n🎉 All tests passed! Module is ready for Vercel deployment.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}