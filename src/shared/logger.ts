/**
 * Logger Utility
 * 
 * Centralized logging for the application
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class LoggerClass {
  private level: LogLevel = LogLevel.INFO;
  private prefix = '[Geeked.Out]';

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      this.log(LogLevel.DEBUG, message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      this.log(LogLevel.INFO, message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      this.log(LogLevel.WARN, message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      this.log(LogLevel.ERROR, message, ...args);
    }
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level].padEnd(5);
    const logMessage = `${this.prefix} [${timestamp}] ${levelName}: ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, ...args);
        break;
      default:
        console.log(logMessage, ...args);
    }
  }
}

export const Logger = new LoggerClass();
