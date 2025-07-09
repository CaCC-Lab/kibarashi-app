const handler = require('./api/v1/suggestions');

const mockRes = {
  setHeader: (key, value) => console.log(`Header: ${key}: ${value}`),
  status: (code) => ({
    json: (data) => {
      console.log(`Status: ${code}`);
      console.log('Response:', JSON.stringify(data, null, 2));
      return mockRes;
    },
    end: () => {
      console.log('Response ended');
      return mockRes;
    }
  }),
  json: (data) => {
    console.log('Response:', JSON.stringify(data, null, 2));
    return mockRes;
  }
};

const testReq = {
  query: { situation: 'workplace', duration: '5' },
  url: '/api/v1/suggestions?situation=workplace&duration=5',
  method: 'GET'
};

console.log('=== API テスト開始 ===');
handler(testReq, mockRes).catch(console.error);