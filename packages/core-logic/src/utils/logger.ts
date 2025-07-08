// Simple logger implementation for Vercel compatibility
interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

class SimpleLogger implements Logger {
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (meta && typeof meta === 'object') {
      try {
        const metaString = JSON.stringify(meta);
        return `${baseMessage} ${metaString}`;
      } catch (error) {
        return `${baseMessage} [Meta serialization error]`;
      }
    }
    
    return baseMessage;
  }

  info(message: string, meta?: any): void {
    console.info(this.formatMessage('INFO', message, meta));
  }

  error(message: string, meta?: any): void {
    console.error(this.formatMessage('ERROR', message, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('WARN', message, meta));
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.debug(this.formatMessage('DEBUG', message, meta));
    }
  }
}

export const logger: Logger = new SimpleLogger();