#!/usr/bin/env node

// APIエンドポイントのテストスクリプト
const baseUrl = process.argv[2] || 'https://kibarashi-app.vercel.app';

async function testEndpoint(path) {
  console.log(`\nTesting ${path}...`);
  try {
    const response = await fetch(`${baseUrl}${path}`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    return response.status === 200;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`Testing API endpoints at ${baseUrl}`);
  
  const endpoints = [
    '/api/v1/context',
    '/api/v1/suggestions?situation=workplace&duration=5',
  ];
  
  let allPassed = true;
  
  for (const endpoint of endpoints) {
    const passed = await testEndpoint(endpoint);
    if (!passed) {
      allPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed!');
  process.exit(allPassed ? 0 : 1);
}

runTests();