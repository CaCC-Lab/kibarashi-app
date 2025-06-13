module.exports = {
  extends: ['./.eslintrc.js'],
  rules: {
    // モック関連の使用を禁止
    'no-restricted-imports': [
      'error',
      {
        patterns: ['@jest/globals'],
        paths: [
          {
            name: 'vitest',
            importNames: ['mock', 'mocked', 'vi'],
            message: '開発規約: モックの使用は禁止されています。実際のサービスを使用してください。'
          }
        ]
      }
    ],
    'no-restricted-properties': [
      'error',
      {
        object: 'jest',
        property: 'mock',
        message: '開発規約: jest.mock()の使用は禁止されています。'
      },
      {
        object: 'vi',
        property: 'mock',
        message: '開発規約: vi.mock()の使用は禁止されています。'
      }
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name=/mock/i]',
        message: '開発規約: モック関数の使用は禁止されています。'
      },
      {
        selector: 'MemberExpression[property.name=/mockResolvedValue|mockRejectedValue|mockImplementation|mockReturnValue/]',
        message: '開発規約: モック関数のメソッドの使用は禁止されています。'
      }
    ]
  }
};