// 提案システムのテストスクリプト
const { getFallbackSuggestions } = require('./api/v1/_lib/fallback.js');

console.log('=== 提案システムのテスト開始 ===\n');

// テスト1: 基本的な提案取得
console.log('テスト1: 基本的な提案取得');
try {
  const suggestions1 = getFallbackSuggestions('workplace', 5, 'office_worker');
  console.log('✅ 提案数:', suggestions1.length);
  console.log('✅ 提案タイトル:', suggestions1.map(s => s.title));
  console.log('✅ 提案ID:', suggestions1.map(s => s.id));
} catch (error) {
  console.error('❌ エラー:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// テスト2: ランダム性の確認（5回連続実行）
console.log('テスト2: ランダム性の確認（5回連続実行）');
const results = [];
for (let i = 0; i < 5; i++) {
  try {
    const suggestions = getFallbackSuggestions('workplace', 5, 'office_worker');
    const titles = suggestions.map(s => s.title);
    results.push(titles);
    console.log(`実行${i + 1}:`, titles);
  } catch (error) {
    console.error(`❌ 実行${i + 1}でエラー:`, error.message);
  }
}

console.log('\n' + '='.repeat(50) + '\n');

// テスト3: 結果の多様性分析
console.log('テスト3: 結果の多様性分析');
const allTitles = results.flat();
const uniqueTitles = [...new Set(allTitles)];
console.log('✅ 全提案数:', allTitles.length);
console.log('✅ ユニーク提案数:', uniqueTitles.length);
console.log('✅ 多様性率:', (uniqueTitles.length / allTitles.length * 100).toFixed(2) + '%');

// 完全に同じ結果が2回以上あるかチェック
const resultStrings = results.map(r => r.join('|'));
const uniqueResults = [...new Set(resultStrings)];
console.log('✅ ユニーク結果セット:', uniqueResults.length);
console.log('✅ 同じ結果が2回以上:', uniqueResults.length < results.length ? 'YES ❌' : 'NO ✅');

console.log('\n' + '='.repeat(50) + '\n');

// テスト4: 異なるパラメータでのテスト
console.log('テスト4: 異なるパラメータでのテスト');
const testCases = [
  { situation: 'workplace', duration: 5, ageGroup: 'office_worker' },
  { situation: 'workplace', duration: 15, ageGroup: 'office_worker' },
  { situation: 'home', duration: 5, ageGroup: 'office_worker' },
  { situation: 'outside', duration: 5, ageGroup: 'office_worker' },
  { situation: 'job_hunting', duration: 5, ageGroup: 'job_hunting' }
];

for (const testCase of testCases) {
  try {
    const suggestions = getFallbackSuggestions(testCase.situation, testCase.duration, testCase.ageGroup);
    console.log(`${testCase.situation}/${testCase.duration}分/${testCase.ageGroup}:`, suggestions.length, '件');
    console.log('  タイトル:', suggestions.map(s => s.title));
  } catch (error) {
    console.error(`❌ ${testCase.situation}/${testCase.duration}分/${testCase.ageGroup}でエラー:`, error.message);
  }
}

console.log('\n=== テスト完了 ===');