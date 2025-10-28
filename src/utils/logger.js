/**
 * Logger utility for consistent logging across the application
 */
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  log(level, message, data = null) {
    if (!this.isDevelopment && level === 'debug') return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    const logMethod = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn : 
                     level === 'debug' ? console.debug : console.log;

    if (data) {
      logMethod(logMessage, data);
    } else {
      logMethod(logMessage);
    }

    // In production, you might want to send logs to a logging service
    if (!this.isDevelopment && (level === 'error' || level === 'warn')) {
      this.sendToLoggingService(level, message, data);
    }
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  debug(message, data) {
    this.log('debug', message, data);
  }

  sendToLoggingService(level, message, data) {
    // Implement your logging service integration here
    // e.g., Sentry, LogRocket, etc.
    try {
      // Example: Send to external logging service
      // loggerService.send({ level, message, data, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to send log to service:', error);
    }
  }
}

export const logger = new Logger();
export default logger;