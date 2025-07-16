// Comprehensive logging system
import { isDevelopment, isProduction } from './env';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Log entry interface
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
  stack?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  maxLogSize: number;
  remoteEndpoint?: string;
  contextFields: string[];
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableFile: false,
  enableRemote: isProduction,
  maxLogSize: 1000,
  contextFields: ['userId', 'sessionId', 'requestId'],
};

// Logger class
class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private context: Record<string, any> = {};

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Set global context
  setContext(context: Record<string, any>) {
    this.context = { ...this.context, ...context };
  }

  // Clear context
  clearContext() {
    this.context = {};
  }

  // Get current context
  getContext() {
    return { ...this.context };
  }

  // Core logging method
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (level < this.config.minLevel) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: { ...this.context, ...context },
      ...(error && { error }),
      ...(error?.stack && { stack: error.stack }),
    };

    // Add to internal log storage
    this.addToLogs(logEntry);

    // Output to console
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Send to remote endpoint
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.logToRemote(logEntry);
    }
  }

  // Add log entry to internal storage
  private addToLogs(entry: LogEntry) {
    this.logs.push(entry);

    // Maintain max log size
    if (this.logs.length > this.config.maxLogSize) {
      this.logs = this.logs.slice(-this.config.maxLogSize);
    }
  }

  // Log to console with appropriate styling
  private logToConsole(entry: LogEntry) {
    const { level, message, timestamp, context, error } = entry;
    const timeStr = timestamp.toISOString();
    const levelStr = LogLevel[level];
    
    const logMessage = `[${timeStr}] ${levelStr}: ${message}`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, context, error);
        break;
      case LogLevel.INFO:
        console.info(logMessage, context);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, context, error);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logMessage, context, error);
        break;
    }
  }

  // Send log to remote endpoint
  private async logToRemote(entry: LogEntry) {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          timestamp: entry.timestamp.toISOString(),
          error: entry.error ? {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack,
          } : undefined,
        }),
      });
    } catch (error) {
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.FATAL, message, context, error);
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Get logs by time range
  getLogsByTimeRange(start: Date, end: Date): LogEntry[] {
    return this.logs.filter(log => 
      log.timestamp >= start && log.timestamp <= end
    );
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Create child logger with additional context
  child(context: Record<string, any>): Logger {
    const childLogger = new Logger(this.config);
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }
}

// Global logger instance
const logger = new Logger();

// Export the logger instance
export default logger;

// Utility functions

// Create a logger for a specific module
export function createModuleLogger(moduleName: string): Logger {
  return logger.child({ module: moduleName });
}

// Create a logger for API requests
export function createApiLogger(endpoint: string, method: string): Logger {
  return logger.child({ 
    type: 'api',
    endpoint,
    method,
    requestId: generateRequestId(),
  });
}

// Create a logger for database operations
export function createDbLogger(operation: string, collection?: string): Logger {
  return logger.child({ 
    type: 'database',
    operation,
    collection,
  });
}

// Generate unique request ID
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Error logging utilities
export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, context, error);
}

export function logApiError(error: Error, endpoint: string, method: string) {
  const apiLogger = createApiLogger(endpoint, method);
  apiLogger.error(`API Error: ${error.message}`, { error: error.name }, error);
}

export function logDbError(error: Error, operation: string, collection?: string) {
  const dbLogger = createDbLogger(operation, collection);
  dbLogger.error(`Database Error: ${error.message}`, { error: error.name }, error);
}

// Performance logging
export function logPerformance(operation: string, duration: number, context?: Record<string, any>) {
  logger.info(`Performance: ${operation} took ${duration}ms`, {
    type: 'performance',
    operation,
    duration,
    ...context,
  });
}

// User action logging
export function logUserAction(action: string, userId?: string, context?: Record<string, any>) {
  logger.info(`User Action: ${action}`, {
    type: 'user_action',
    action,
    userId,
    ...context,
  });
}

// Security logging
export function logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>) {
  const level = severity === 'critical' ? LogLevel.FATAL : 
                severity === 'high' ? LogLevel.ERROR :
                severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;
  
  const securityContext = { type: 'security', event, severity, ...context };
  
  if (level === LogLevel.FATAL) {
    logger.fatal(`Security Event: ${event}`, securityContext);
  } else if (level === LogLevel.ERROR) {
    logger.error(`Security Event: ${event}`, securityContext);
  } else if (level === LogLevel.WARN) {
    logger.warn(`Security Event: ${event}`, securityContext);
  } else {
    logger.info(`Security Event: ${event}`, securityContext);
  }
}

// Middleware for Express.js (if using API routes)
export function createLoggingMiddleware() {
  return (req: any, res: any, next: any) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    // Add request ID to request object
    req.requestId = requestId;
    
    // Create request logger
    const requestLogger = createApiLogger(req.path, req.method);
    requestLogger.setContext({ requestId });
    
    // Log request
    requestLogger.info('Request started', {
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
    
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
      const duration = Date.now() - startTime;
      
      requestLogger.info('Request completed', {
        statusCode: res.statusCode,
        duration,
      });
      
      originalEnd.apply(this, args);
    };
    
    next();
  };
}

// React hook for logging
export function useLogger(moduleName?: string) {
  const moduleLogger = moduleName ? createModuleLogger(moduleName) : logger;
  
  return {
    debug: moduleLogger.debug.bind(moduleLogger),
    info: moduleLogger.info.bind(moduleLogger),
    warn: moduleLogger.warn.bind(moduleLogger),
    error: moduleLogger.error.bind(moduleLogger),
    fatal: moduleLogger.fatal.bind(moduleLogger),
    setContext: moduleLogger.setContext.bind(moduleLogger),
    clearContext: moduleLogger.clearContext.bind(moduleLogger),
  };
}

// Export types and classes
export {
  Logger,
  type LogEntry,
  type LoggerConfig,
};