import { LogLevel, sendLog } from '@/api'

class Logger {
  info(message: string, meta?: unknown): void {
    void sendLog(LogLevel.Info, message, meta)
  }

  warn(message: string, meta?: unknown): void {
    void sendLog(LogLevel.Warn, message, meta)
  }

  error(message: string, meta?: unknown): void {
    void sendLog(LogLevel.Error, message, meta)
  }

  debug(message: string, meta?: unknown): void {
    void sendLog(LogLevel.Debug, message, meta)
  }
}

export const log = new Logger()
