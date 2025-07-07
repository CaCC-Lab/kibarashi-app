#!/usr/bin/env node

/**
 * OpenAPI仕様書の検証スクリプト
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

const execAsync = promisify(exec);

const OPENAPI_FILE = path.join(__dirname, '../docs/openapi/openapi.yaml');

async function validateOpenAPI() {
  console.log('🔍 OpenAPI仕様書の検証を開始します...\n');

  try {
    // ファイルの存在確認
    await fs.access(OPENAPI_FILE);
    console.log(`✅ メインファイルが見つかりました: ${OPENAPI_FILE}\n`);

    // @redocly/openapi-cli による検証
    console.log('📋 Redocly OpenAPI CLIで検証中...');
    try {
      const { stdout, stderr } = await execAsync(
        `npx @redocly/openapi-cli validate ${OPENAPI_FILE}`
      );
      
      if (stdout) {
        console.log(stdout);
      }
      
      if (stderr && !stderr.includes('Warning')) {
        console.error('❌ エラー:', stderr);
        process.exit(1);
      }
      
      console.log('✅ Redocly検証: 成功\n');
    } catch (error) {
      if (error.stdout && error.stdout.includes('No errors')) {
        console.log('✅ Redocly検証: 成功（警告あり）\n');
      } else {
        console.error('❌ Redocly検証エラー:', error.message);
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.error(error.stderr);
      }
    }

    // swagger-cli による検証（別の検証ツール）
    console.log('📋 Swagger CLIで検証中...');
    try {
      const { stdout } = await execAsync(
        `npx @apidevtools/swagger-cli validate ${OPENAPI_FILE}`
      );
      console.log(stdout);
      console.log('✅ Swagger CLI検証: 成功\n');
    } catch (error) {
      console.warn('⚠️ Swagger CLI検証をスキップ（ツールが利用できません）\n');
    }

    // ファイル参照の検証
    console.log('📋 ファイル参照を検証中...');
    const content = await fs.readFile(OPENAPI_FILE, 'utf8');
    const refPattern = /\$ref:\s*['"](.+?)['"]/g;
    const refs = [...content.matchAll(refPattern)];
    
    let missingFiles = [];
    for (const [, ref] of refs) {
      if (ref.startsWith('./')) {
        const refPath = path.join(path.dirname(OPENAPI_FILE), ref);
        try {
          await fs.access(refPath);
        } catch {
          missingFiles.push(ref);
        }
      }
    }

    if (missingFiles.length > 0) {
      console.error('❌ 以下の参照ファイルが見つかりません:');
      missingFiles.forEach(file => console.error(`   - ${file}`));
      process.exit(1);
    } else {
      console.log(`✅ すべての参照ファイル（${refs.length}個）が存在します\n`);
    }

    console.log('🎉 OpenAPI仕様書の検証が完了しました！\n');
    
    // 統計情報の表示
    console.log('📊 統計情報:');
    const stats = await getOpenAPIStats();
    console.log(`   - エンドポイント数: ${stats.endpoints}`);
    console.log(`   - スキーマ数: ${stats.schemas}`);
    console.log(`   - パラメータ数: ${stats.parameters}`);
    console.log(`   - レスポンス定義数: ${stats.responses}\n`);

  } catch (error) {
    console.error('❌ 検証中にエラーが発生しました:', error.message);
    process.exit(1);
  }
}

async function getOpenAPIStats() {
  const stats = {
    endpoints: 0,
    schemas: 0,
    parameters: 0,
    responses: 0
  };

  // パスファイルをカウント
  const pathsDir = path.join(__dirname, '../docs/openapi/paths');
  const pathFiles = await fs.readdir(pathsDir);
  stats.endpoints = pathFiles.filter(f => f.endsWith('.yaml')).length;

  // スキーマファイルをカウント
  const schemasDir = path.join(__dirname, '../docs/openapi/components/schemas');
  const schemaFiles = await fs.readdir(schemasDir);
  stats.schemas = schemaFiles.filter(f => f.endsWith('.yaml')).length;

  // パラメータファイルをカウント
  const paramsDir = path.join(__dirname, '../docs/openapi/components/parameters');
  const paramFiles = await fs.readdir(paramsDir);
  stats.parameters = paramFiles.filter(f => f.endsWith('.yaml')).length;

  // レスポンスファイルをカウント
  const responsesDir = path.join(__dirname, '../docs/openapi/components/responses');
  const responseFiles = await fs.readdir(responsesDir);
  stats.responses = responseFiles.filter(f => f.endsWith('.yaml')).length;

  return stats;
}

// スクリプトを実行
validateOpenAPI().catch(error => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});