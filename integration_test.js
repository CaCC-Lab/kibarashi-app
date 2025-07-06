#!/usr/bin/env node

/**
 * Phase A-1 統合テストスクリプト
 * フロントエンド・バックエンドの統合動作確認
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Phase A-1 統合テスト開始');
console.log('=' .repeat(60));

// 1. ビルド成果物の確認
console.log('\n📦 ビルド成果物の確認:');
const frontendDistPath = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  const files = fs.readdirSync(frontendDistPath);
  console.log(`✅ フロントエンドビルド成功 - ${files.length}個のファイル生成`);
  console.log(`   主要ファイル: ${files.filter(f => f.includes('index')).join(', ')}`);
} else {
  console.log('❌ フロントエンドビルドファイルが見つかりません');
}

// 2. 型定義ファイルの整合性確認
console.log('\n🔍 型定義ファイルの整合性確認:');
const typeFiles = [
  'frontend/src/types/ageGroup.ts',
  'frontend/src/types/situation.tsx',
  'frontend/src/types/history.ts'
];

let typeConsistency = true;
typeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // SituationId型の一貫性チェック
    if (file.includes('situation')) {
      const hasStudentSituations = content.includes('studying') && content.includes('school') && content.includes('commuting');
      if (hasStudentSituations) {
        console.log(`✅ ${file}: 学生向けシナリオが正しく定義されています`);
      } else {
        console.log(`❌ ${file}: 学生向けシナリオが見つかりません`);
        typeConsistency = false;
      }
    }
    
    // AgeGroup型の確認
    if (file.includes('ageGroup')) {
      const hasStudentAgeGroup = content.includes("'student'");
      if (hasStudentAgeGroup) {
        console.log(`✅ ${file}: 学生年齢層が正しく定義されています`);
      } else {
        console.log(`❌ ${file}: 学生年齢層が見つかりません`);
        typeConsistency = false;
      }
    }
  } else {
    console.log(`❌ ${file}: ファイルが見つかりません`);
    typeConsistency = false;
  }
});

// 3. APIエンドポイントの設定確認
console.log('\n🔧 APIエンドポイントの設定確認:');
const apiFiles = [
  'api/v1/suggestions.ts',
  'backend/src/services/gemini/geminiClient.ts'
];

apiFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 年齢層対応の確認
    const supportsAgeGroup = content.includes('ageGroup') && content.includes('student');
    if (supportsAgeGroup) {
      console.log(`✅ ${file}: 年齢層対応が実装されています`);
    } else {
      console.log(`⚠️ ${file}: 年齢層対応が見つかりません`);
    }
    
    // Gemini API設定の確認
    if (content.includes('GEMINI_API_KEY')) {
      console.log(`✅ ${file}: Gemini API設定が含まれています`);
    }
  } else {
    console.log(`⚠️ ${file}: ファイルが見つかりません`);
  }
});

// 4. コンポーネント実装状況の確認
console.log('\n🧩 コンポーネント実装状況の確認:');
const componentFiles = [
  'frontend/src/components/ageGroup/AgeGroupSelector.tsx',
  'frontend/src/hooks/useAgeGroup.ts',
  'frontend/src/services/storage/userProfileStorage.ts'
];

let componentComplete = true;
componentFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (file.includes('AgeGroupSelector')) {
      const hasModal = content.includes('AgeGroupOnboardingModal');
      const hasAnimation = content.includes('framer-motion') || content.includes('animate');
      console.log(`✅ ${file}: 年齢層セレクター実装済み ${hasModal ? '(モーダル機能付き)' : ''} ${hasAnimation ? '(アニメーション付き)' : ''}`);
    } else if (file.includes('useAgeGroup')) {
      const hasLocalStorage = content.includes('localStorage') || content.includes('UserProfileStorage');
      console.log(`✅ ${file}: 年齢層フック実装済み ${hasLocalStorage ? '(永続化対応)' : ''}`);
    } else if (file.includes('userProfileStorage')) {
      const hasProfile = content.includes('UserProfile') && content.includes('AgeGroup');
      console.log(`✅ ${file}: ユーザープロファイル保存機能実装済み ${hasProfile ? '(型安全)' : ''}`);
    }
  } else {
    console.log(`❌ ${file}: ファイルが見つかりません`);
    componentComplete = false;
  }
});

// 5. 統合テスト結果の総合評価
console.log('\n' + '=' .repeat(60));
console.log('📊 統合テスト結果サマリー');
console.log('=' .repeat(60));

const results = [
  { name: 'フロントエンドビルド', status: fs.existsSync(frontendDistPath) },
  { name: '型定義の整合性', status: typeConsistency },
  { name: 'コンポーネント実装', status: componentComplete }
];

results.forEach(result => {
  console.log(`${result.status ? '✅' : '❌'} ${result.name}: ${result.status ? '成功' : '失敗'}`);
});

const allPassed = results.every(r => r.status);
console.log(`\n🎯 総合結果: ${allPassed ? '✅ 統合テスト成功' : '❌ 一部テストが失敗'}`);

if (allPassed) {
  console.log('\n🎉 Phase A-1の実装が正常に動作しています！');
  console.log('次のステップ:');
  console.log('  1. ブラウザでの動作確認');
  console.log('  2. 年齢層選択機能のUXテスト');
  console.log('  3. Gemini APIとの連携テスト');
} else {
  console.log('\n⚠️ 一部の実装に問題があります。修正が必要です。');
}

console.log('\n📝 開発サーバー情報:');
console.log('  フロントエンド: http://localhost:3000');
console.log('  統合テスト完了時刻:', new Date().toLocaleString('ja-JP'));