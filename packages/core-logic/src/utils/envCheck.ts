// 環境変数チェック用ユーティリティ
export const checkEnvironmentVariables = () => {
  const requiredVars = [
    'GEMINI_API_KEY_1',
    'GEMINI_API_KEY_2', 
    'GEMINI_API_KEY_3',
    'GEMINI_KEY_ROTATION_ENABLED',
    'GEMINI_RETRY_ATTEMPTS',
    'GEMINI_COOLDOWN_MINUTES'
  ];

  const missingVars: string[] = [];
  const configuredVars: Record<string, string> = {};

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else {
      // APIキーは最初の8文字のみ表示
      if (varName.includes('API_KEY')) {
        configuredVars[varName] = value.substring(0, 8) + '...';
      } else {
        configuredVars[varName] = value;
      }
    }
  });

  return {
    isValid: missingVars.length === 0,
    missingVars,
    configuredVars,
    summary: {
      totalKeys: Object.keys(configuredVars).filter(k => k.includes('API_KEY')).length,
      rotationEnabled: process.env.GEMINI_KEY_ROTATION_ENABLED === 'true',
      retryAttempts: parseInt(process.env.GEMINI_RETRY_ATTEMPTS || '3'),
      cooldownMinutes: parseInt(process.env.GEMINI_COOLDOWN_MINUTES || '60')
    }
  };
};

// 開発環境での確認用
if (process.env.NODE_ENV === 'development') {
  const check = checkEnvironmentVariables();
  console.log('🔍 Environment Variables Check:', check);
}