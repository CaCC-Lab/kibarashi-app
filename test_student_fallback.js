#!/usr/bin/env node

/**
 * 学生向けフォールバックデータテスト
 * Gemini APIなしでも学生向け提案が正常に返されるかを確認
 */

const { fallbackSuggestions } = require('./api/v1/fallbackData');

console.log('🎓 学生向けフォールバックデータテスト開始');
console.log('=' .repeat(60));

// テストケース定義
const testCases = [
  { situation: 'studying', duration: 5, description: '勉強中・5分' },
  { situation: 'studying', duration: 15, description: '勉強中・15分' },
  { situation: 'studying', duration: 30, description: '勉強中・30分' },
  { situation: 'school', duration: 5, description: '学校・5分' },
  { situation: 'school', duration: 15, description: '学校・15分' },
  { situation: 'school', duration: 30, description: '学校・30分' },
  { situation: 'commuting', duration: 5, description: '通学中・5分' },
  { situation: 'commuting', duration: 15, description: '通学中・15分' },
  { situation: 'commuting', duration: 30, description: '通学中・30分' }
];

let allTestsPassed = true;
let totalSuggestions = 0;

console.log('\n🔍 学生向けシナリオ別テスト結果:');

testCases.forEach((testCase, index) => {
  const { situation, duration, description } = testCase;
  
  console.log(`\n${index + 1}. ${description}`);
  
  // フォールバックデータの取得を試行
  try {
    const suggestions = fallbackSuggestions[situation]?.[duration] || [];
    
    if (suggestions.length === 0) {
      console.log(`   ❌ 提案が見つかりません`);
      allTestsPassed = false;
    } else {
      console.log(`   ✅ ${suggestions.length}個の提案を発見`);
      totalSuggestions += suggestions.length;
      
      // 各提案の品質チェック
      suggestions.forEach((suggestion, suggestionIndex) => {
        const hasRequiredFields = suggestion.id && 
                                 suggestion.title && 
                                 suggestion.description && 
                                 suggestion.category && 
                                 suggestion.duration && 
                                 suggestion.steps;
        
        if (hasRequiredFields) {
          // 学生向けの特徴チェック
          const isStudentFriendly = suggestion.title.includes('✨') || 
                                   suggestion.title.includes('💪') || 
                                   suggestion.title.includes('🚃') ||
                                   suggestion.title.includes('👫') ||
                                   suggestion.title.includes('🎵') ||
                                   suggestion.description.includes('学生') ||
                                   suggestion.description.includes('勉強') ||
                                   suggestion.description.includes('授業') ||
                                   suggestion.description.includes('通学');
          
          console.log(`      ${suggestionIndex + 1}. "${suggestion.title}" (${suggestion.category}) ${isStudentFriendly ? '🎓' : ''}`);
          
          if (suggestion.steps.length < 3) {
            console.log(`         ⚠️ ステップが少なすぎます (${suggestion.steps.length}個)`);
          }
        } else {
          console.log(`      ❌ ${suggestionIndex + 1}番目の提案に必須フィールドが不足`);
          allTestsPassed = false;
        }
      });
    }
  } catch (error) {
    console.log(`   ❌ エラー: ${error.message}`);
    allTestsPassed = false;
  }
});

// 統計情報の表示
console.log('\n' + '=' .repeat(60));
console.log('📊 学生向けフォールバックデータ統計');
console.log('=' .repeat(60));

const categoryStats = { '認知的': 0, '行動的': 0 };
const durationStats = { 5: 0, 15: 0, 30: 0 };

['studying', 'school', 'commuting'].forEach(situation => {
  [5, 15, 30].forEach(duration => {
    const suggestions = fallbackSuggestions[situation]?.[duration] || [];
    durationStats[duration] += suggestions.length;
    
    suggestions.forEach(suggestion => {
      categoryStats[suggestion.category]++;
    });
  });
});

console.log(`\n🎯 総合結果:`);
console.log(`   総提案数: ${totalSuggestions}個`);
console.log(`   認知的提案: ${categoryStats['認知的']}個`);
console.log(`   行動的提案: ${categoryStats['行動的']}個`);
console.log(`   5分間提案: ${durationStats[5]}個`);
console.log(`   15分間提案: ${durationStats[15]}個`);
console.log(`   30分間提案: ${durationStats[30]}個`);

console.log(`\n🔍 品質評価:`);
const cognitiveRatio = Math.round((categoryStats['認知的'] / totalSuggestions) * 100);
const behavioralRatio = Math.round((categoryStats['行動的'] / totalSuggestions) * 100);
console.log(`   認知的/行動的バランス: ${cognitiveRatio}% / ${behavioralRatio}%`);

if (cognitiveRatio >= 40 && cognitiveRatio <= 60) {
  console.log(`   ✅ カテゴリバランスが良好`);
} else {
  console.log(`   ⚠️ カテゴリバランスに偏りがあります`);
}

console.log(`\n🎓 学生向け特徴評価:`);
let studentFeatureCount = 0;
['studying', 'school', 'commuting'].forEach(situation => {
  [5, 15, 30].forEach(duration => {
    const suggestions = fallbackSuggestions[situation]?.[duration] || [];
    suggestions.forEach(suggestion => {
      if (suggestion.description.includes('学生') || 
          suggestion.description.includes('勉強') ||
          suggestion.description.includes('授業') ||
          suggestion.title.includes('✨') ||
          suggestion.title.includes('💪')) {
        studentFeatureCount++;
      }
    });
  });
});

const studentFeatureRatio = Math.round((studentFeatureCount / totalSuggestions) * 100);
console.log(`   学生向け特徴を持つ提案: ${studentFeatureCount}個 (${studentFeatureRatio}%)`);

if (studentFeatureRatio >= 70) {
  console.log(`   ✅ 学生向けカスタマイゼーションが十分`);
} else {
  console.log(`   ⚠️ 学生向けカスタマイゼーションを強化推奨`);
}

// 最終判定
console.log('\n' + '=' .repeat(60));
if (allTestsPassed && totalSuggestions >= 25) {
  console.log('🎉 学生向けフォールバックデータテスト成功！');
  console.log('✅ Phase A-1の学生向けフォールバックデータ拡充が完了しました');
  console.log('\n📝 次のステップ:');
  console.log('  1. A/Bテスト実装とメトリクス収集');
  console.log('  2. 実際のブラウザでの学生機能テスト');
  console.log('  3. Gemini APIとフォールバックの切り替え動作確認');
} else {
  console.log('❌ 学生向けフォールバックデータに問題があります');
  console.log('修正が必要な項目を確認してください');
}

console.log(`\nテスト完了時刻: ${new Date().toLocaleString('ja-JP')}`);