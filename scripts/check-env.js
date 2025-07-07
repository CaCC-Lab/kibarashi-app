#!/usr/bin/env node

/**
 * 環境変数チェックスクリプト
 * 必要な環境変数が設定されているか検証します
 */

const fs = require('fs');
const path = require('path');

// 色付きコンソール出力
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`)
};

// 必須環境変数の定義
const requiredEnvVars = {
  backend: {
    required: [
      'PORT',
      'NODE_ENV',
      'CORS_ORIGIN',
      'GEMINI_API_KEY_1'  // 最低1つは必須
    ],
    optional: [
      'GEMINI_API_KEY_2',
      'GEMINI_API_KEY_3',
      'GOOGLE_CLOUD_PROJECT_ID',
      'TTS_LANGUAGE_CODE',
      'REDIS_HOST',
      'REDIS_PORT',
      'LOG_LEVEL'
    ]
  },
  frontend: {
    required: [
      'VITE_API_URL'
    ],
    optional: [
      'VITE_API_VERSION',
      'VITE_ENABLE_VOICE',
      'VITE_ENABLE_OFFLINE',
      'VITE_DEBUG_MODE'
    ]
  }
};

// .envファイルを読み込んで解析
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    // コメントと空行をスキップ
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }
    
    const [key, ...valueParts] = line.split('=');
    if (key) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
}

// 環境変数の値をマスク（セキュリティのため）
function maskValue(key, value) {
  if (!value) return '<not set>';
  
  // APIキーなどの機密情報は一部だけ表示
  if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')) {
    if (value.length > 8) {
      return value.substring(0, 4) + '***' + value.substring(value.length - 4);
    }
    return '***';
  }
  
  return value;
}

// 環境変数をチェック
function checkEnvironment(name, envPath, required, optional) {
  console.log(`\n${colors.blue}=== ${name}の環境変数チェック ===${colors.reset}`);
  console.log(`📁 ファイル: ${envPath}`);
  
  const env = parseEnvFile(envPath);
  
  if (!env) {
    log.error(`${envPath} が見つかりません`);
    log.info(`${envPath.replace('.env', '.env.example')} をコピーして作成してください`);
    return false;
  }
  
  let hasError = false;
  
  // 必須変数のチェック
  console.log('\n必須環境変数:');
  required.forEach(key => {
    const value = env[key];
    if (value && value !== '' && value !== 'your-' + key.toLowerCase()) {
      log.success(`${key} = ${maskValue(key, value)}`);
    } else {
      log.error(`${key} が設定されていません`);
      hasError = true;
    }
  });
  
  // オプション変数のチェック
  console.log('\nオプション環境変数:');
  optional.forEach(key => {
    const value = env[key];
    if (value && value !== '' && value !== 'your-' + key.toLowerCase()) {
      log.success(`${key} = ${maskValue(key, value)}`);
    } else {
      log.warning(`${key} = <not set>`);
    }
  });
  
  // 追加の変数（定義されていないもの）
  const definedVars = [...required, ...optional];
  const extraVars = Object.keys(env).filter(key => !definedVars.includes(key));
  
  if (extraVars.length > 0) {
    console.log('\nその他の環境変数:');
    extraVars.forEach(key => {
      log.info(`${key} = ${maskValue(key, env[key])}`);
    });
  }
  
  return !hasError;
}

// API接続テスト
async function testConnections(backendEnv) {
  console.log(`\n${colors.blue}=== API接続テスト ===${colors.reset}`);
  
  // Gemini APIキーのチェック
  const geminiKeys = [
    backendEnv['GEMINI_API_KEY_1'],
    backendEnv['GEMINI_API_KEY_2'],
    backendEnv['GEMINI_API_KEY_3']
  ].filter(Boolean);
  
  if (geminiKeys.length === 0) {
    log.error('Gemini APIキーが1つも設定されていません');
  } else {
    log.success(`${geminiKeys.length}個のGemini APIキーが設定されています`);
    if (geminiKeys.length < 3) {
      log.warning('APIレート制限対策のため、3つのキーを設定することを推奨します');
    }
  }
  
  // その他の接続情報
  if (backendEnv['REDIS_HOST']) {
    log.info(`Redis接続: ${backendEnv['REDIS_HOST']}:${backendEnv['REDIS_PORT'] || 6379}`);
  }
}

// メイン処理
async function main() {
  console.log('🔍 環境変数チェックを開始します...\n');
  
  const projectRoot = path.join(__dirname, '..');
  const backendEnvPath = path.join(projectRoot, 'backend', '.env');
  const frontendEnvPath = path.join(projectRoot, 'frontend', '.env');
  
  // バックエンドの環境変数チェック
  const backendOk = checkEnvironment(
    'バックエンド',
    backendEnvPath,
    requiredEnvVars.backend.required,
    requiredEnvVars.backend.optional
  );
  
  // フロントエンドの環境変数チェック
  const frontendOk = checkEnvironment(
    'フロントエンド',
    frontendEnvPath,
    requiredEnvVars.frontend.required,
    requiredEnvVars.frontend.optional
  );
  
  // 接続テスト
  if (backendOk) {
    const backendEnv = parseEnvFile(backendEnvPath);
    await testConnections(backendEnv);
  }
  
  // 結果サマリー
  console.log(`\n${colors.blue}=== チェック結果 ===${colors.reset}`);
  
  if (backendOk && frontendOk) {
    log.success('すべての必須環境変数が設定されています！');
    console.log('\n🚀 開発環境を起動する準備ができました:');
    console.log('   npm run dev');
    process.exit(0);
  } else {
    log.error('必須環境変数が不足しています');
    console.log('\n📝 環境変数の設定方法:');
    console.log('1. backend/.env.example を backend/.env にコピー');
    console.log('2. frontend/.env.example を frontend/.env にコピー');
    console.log('3. 各ファイルに必要な値を設定');
    console.log('\n詳細は docs/environment-setup.md を参照してください');
    process.exit(1);
  }
}

// スクリプトを実行
main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});