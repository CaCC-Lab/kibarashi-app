// ローカルテスト用スクリプト - 修正の動作確認
import { generateEnhancedSuggestions } from './packages/core-logic/dist/index.js';

async function testFix() {
  console.log('🧪 修正されたgenerateEnhancedSuggestions関数のテスト開始');
  
  // 問題が発生していたパラメータ
  const situation = 'studying';
  const duration = 5;
  const ageGroup = 'student';
  const studentContext = undefined;
  const jobHuntingContext = undefined;
  const location = 'Tokyo';

  // GEMINI_API_KEYを一時的に無効化してフォールバック処理をテスト
  const originalApiKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    console.log(`🔍 テストパラメータ: situation=${situation}, duration=${duration}, ageGroup=${ageGroup}, location=${location}`);
    
    const startTime = Date.now();
    const result = await generateEnhancedSuggestions(
      situation,
      duration,
      ageGroup,
      studentContext,
      jobHuntingContext,
      location
    );
    const endTime = Date.now();

    console.log('✅ 関数呼び出し成功！');
    console.log(`⏱️ 実行時間: ${endTime - startTime}ms`);
    console.log(`📊 生成された提案数: ${result.length}`);
    
    // 結果の詳細確認
    result.forEach((suggestion, index) => {
      console.log(`\n📝 提案 ${index + 1}:`);
      console.log(`   ID: ${suggestion.id}`);
      console.log(`   タイトル: ${suggestion.title}`);
      console.log(`   説明: ${suggestion.description}`);
      console.log(`   カテゴリ: ${suggestion.category}`);
      console.log(`   所要時間: ${suggestion.duration}分`);
      console.log(`   拡張フィールド: ${suggestion.displaySteps ? '✅' : '❌'}`);
      console.log(`   音声ガイド: ${suggestion.voiceGuideScript ? '✅' : '❌'}`);
    });

    // 期待される構造のチェック
    const validationResults = result.map((suggestion, index) => {
      const checks = {
        hasId: !!suggestion.id,
        hasTitle: !!suggestion.title,
        hasDescription: !!suggestion.description,
        hasCorrectDuration: suggestion.duration === duration,
        hasValidCategory: ['認知的', '行動的'].includes(suggestion.category),
        hasDisplaySteps: !!suggestion.displaySteps,
        hasVoiceGuide: !!suggestion.voiceGuideScript
      };
      
      const isValid = Object.values(checks).every(Boolean);
      console.log(`\n🔍 提案${index + 1}の検証: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!isValid) {
        Object.entries(checks).forEach(([key, value]) => {
          if (!value) {
            console.log(`   ❌ ${key}: 失敗`);
          }
        });
      }
      
      return isValid;
    });

    const allValid = validationResults.every(Boolean);
    console.log(`\n🎯 総合結果: ${allValid ? '✅ 全ての提案が有効' : '❌ 一部の提案に問題あり'}`);

    if (allValid) {
      console.log('\n🎉 修正が成功しました！API エンドポイントは正常に動作するはずです。');
    } else {
      console.log('\n⚠️ 追加の修正が必要です。');
    }

  } catch (error) {
    console.error('❌ テスト失敗:', error.message);
    console.error('スタックトレース:', error.stack);
    console.log('\n🔧 修正が必要な問題が残っています。');
  } finally {
    // API キーを復元
    if (originalApiKey) {
      process.env.GEMINI_API_KEY = originalApiKey;
    }
  }
}

// 追加テスト: 他のsituationでも動作するかチェック
async function testAllSituations() {
  console.log('\n🔄 全situationでのテスト開始');
  
  const situations = ['workplace', 'home', 'outside', 'studying', 'school', 'commuting', 'job_hunting'];
  const duration = 5;
  const ageGroup = 'student';

  const originalApiKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    for (const situation of situations) {
      try {
        const result = await generateEnhancedSuggestions(situation, duration, ageGroup);
        console.log(`✅ ${situation}: 成功 (${result.length}個の提案)`);
      } catch (error) {
        console.log(`❌ ${situation}: 失敗 - ${error.message}`);
      }
    }
  } finally {
    if (originalApiKey) {
      process.env.GEMINI_API_KEY = originalApiKey;
    }
  }
}

// テスト実行
testFix().then(() => {
  return testAllSituations();
}).then(() => {
  console.log('\n🏁 テスト完了');
}).catch(error => {
  console.error('🚨 テスト実行中にエラー:', error);
});