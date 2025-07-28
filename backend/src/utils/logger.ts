import winston from 'winston';

// 循環参照を安全に処理するためのJSON.stringify代替関数
const safeStringify = (obj: any): string => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_key, val) => {
    if (val != null && typeof val === "object") {
      if (seen.has(val)) {
        return '[Circular]';
      }
      seen.add(val);
    }
    return val;
  });
};

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// カスタムコンソールトランスポート（テスト対応）
class ConsoleTransport extends winston.transports.Console {
  private logLevels = { error: 0, warn: 1, info: 2, debug: 3 };
  
  log(info: any, callback: () => void) {
    try {
      // colorizeされていない元のレベルを取得
      const rawLevel = info[Symbol.for('level')] || info.level;
      // カラーエスケープコードを除去
      // eslint-disable-next-line no-control-regex
      const level = rawLevel.replace(/\u001B\[\d+m/g, '');
      
      // ログレベルチェック：現在の環境での設定レベルより低い場合は出力しない
      const currentLogLevel = getLogLevel();
      const currentLevelNum = this.logLevels[currentLogLevel as keyof typeof this.logLevels] || 2;
      const messageLevelNum = this.logLevels[level as keyof typeof this.logLevels] || 2;
      
      if (messageLevelNum > currentLevelNum) {
        callback();
        return;
      }
      
      // テスト環境とそれ以外で出力形式を変える
      if (process.env.NODE_ENV === 'test') {
        // テスト環境: 構造化されたJSON形式で出力
        const logData = {
          timestamp: info.timestamp,
          level: `[${level}]`,
          message: info.message,
          service: info.service,
          ...Object.fromEntries(
            Object.entries(info).filter(([key]) => 
              !['timestamp', 'level', 'message', 'service', 'splat'].includes(key) &&
              !key.startsWith('Symbol(')
            )
          )
        };
        
        const jsonOutput = safeStringify(logData);
        
        switch (level) {
          case 'error':
            console.error(jsonOutput);
            break;
          case 'warn':
            console.warn(jsonOutput);
            break;
          case 'info':
            console.info(jsonOutput);
            break;
          case 'debug':
            console.debug(jsonOutput);
            break;
          default:
            console.log(jsonOutput);
        }
      } else {
        // 通常環境: 人間が読みやすい形式
        const meta = Object.assign({}, info, {
          level: undefined,
          message: undefined,
          splat: undefined,
          timestamp: undefined,
          service: undefined,
        });
        
        // 不要なSymbolプロパティを除去
        Object.getOwnPropertySymbols(meta).forEach(symbol => {
          delete meta[symbol];
        });
        
        const hasMetadata = Object.keys(meta).length > 0;
        const formattedMessage = hasMetadata ? `${info.message} ${safeStringify(meta)}` : info.message;
        
        switch (level) {
          case 'error':
            console.error(formattedMessage);
            break;
          case 'warn':
            console.warn(formattedMessage);
            break;
          case 'info':
            console.info(formattedMessage);
            break;
          case 'debug':
            console.debug(formattedMessage);
            break;
          default:
            console.log(formattedMessage);
        }
      }
    } catch (error) {
      // フォールバック: 循環参照エラーなどが発生した場合
      console.error('Logger error:', error);
      console.log(info.message || 'Unknown log message');
    }
    
    callback();
  }
}

// 環境別ログレベル設定
const getLogLevel = () => {
  switch (process.env.NODE_ENV) {
    case 'test':
      return 'debug';
    case 'development':
      return 'debug';
    case 'production':
      return process.env.LOG_LEVEL || 'info';
    default:
      return process.env.LOG_LEVEL || 'info';
  }
};

const defaultLogLevel = getLogLevel();

export const logger = winston.createLogger({
  level: defaultLogLevel,
  format: logFormat,
  defaultMeta: { service: 'kibarashi-backend' },
  transports: [
    new ConsoleTransport({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// 本番環境ではファイルにも出力
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  );
}