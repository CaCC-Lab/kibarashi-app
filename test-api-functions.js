#!/usr/bin/env node

/**
 * Vercel Functions のローカルテストスクリプト
 * vercel dev の代替手段として直接APIファンクションを実行
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock VercelRequest and VercelResponse
class MockVercelRequest {
  constructor(method = 'GET', url = '/', body = {}, query = {}, headers = {}) {
    this.method = method;
    this.url = url;
    this.body = body;
    this.query = query;
    this.headers = headers;
  }
}

class MockVercelResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.responseData = null;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  json(data) {
    this.responseData = data;
    console.log(`Response Status: ${this.statusCode}`);
    console.log('Response Headers:', this.headers);
    console.log('Response Body:', JSON.stringify(data, null, 2));
    return this;
  }

  end() {
    console.log(`Response Status: ${this.statusCode}`);
    console.log('Response Headers:', this.headers);
    console.log('Response ended');
    return this;
  }
}

// Test Health API
async function testHealthAPI() {
  console.log('\n=== Health API Test ===');
  
  try {
    // Import health function (need to handle ES modules)
    const healthModule = await import('./api/v1/health.ts');
    const healthHandler = healthModule.default;
    
    const req = new MockVercelRequest('GET', '/api/v1/health');
    const res = new MockVercelResponse();
    
    await healthHandler(req, res);
    
    console.log('✅ Health API test completed');
    return res.responseData;
  } catch (error) {
    console.error('❌ Health API test failed:', error.message);
    return null;
  }
}

// Test Suggestions API
async function testSuggestionsAPI() {
  console.log('\n=== Suggestions API Test ===');
  
  try {
    const suggestionsModule = await import('./api/v1/suggestions.ts');
    const suggestionsHandler = suggestionsModule.default;
    
    const req = new MockVercelRequest('GET', '/api/v1/suggestions', {}, {
      situation: 'workplace',
      duration: '5',
      ageGroup: 'office_worker'
    });
    const res = new MockVercelResponse();
    
    await suggestionsHandler(req, res);
    
    console.log('✅ Suggestions API test completed');
    return res.responseData;
  } catch (error) {
    console.error('❌ Suggestions API test failed:', error.message);
    console.error('Error details:', error);
    return null;
  }
}

// Test TTS API
async function testTTSAPI() {
  console.log('\n=== TTS API Test ===');
  
  try {
    const ttsModule = await import('./api/v1/tts.ts');
    const ttsHandler = ttsModule.default;
    
    const req = new MockVercelRequest('POST', '/api/v1/tts', {
      text: 'テストメッセージです',
      voiceConfig: {
        languageCode: 'ja-JP',
        name: 'ja-JP-Neural2-B',
        ssmlGender: 'FEMALE'
      }
    });
    const res = new MockVercelResponse();
    
    await ttsHandler(req, res);
    
    console.log('✅ TTS API test completed');
    return res.responseData;
  } catch (error) {
    console.error('❌ TTS API test failed:', error.message);
    console.error('Error details:', error);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Functions Tests...\n');
  
  const results = {
    health: await testHealthAPI(),
    suggestions: await testSuggestionsAPI(),
    tts: await testTTSAPI()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('Health API:', results.health ? '✅ Pass' : '❌ Fail');
  console.log('Suggestions API:', results.suggestions ? '✅ Pass' : '❌ Fail');
  console.log('TTS API:', results.tts ? '✅ Pass' : '❌ Fail');
  
  return results;
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { testHealthAPI, testSuggestionsAPI, testTTSAPI, runAllTests };