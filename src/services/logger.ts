import { LogLevel, sendLog } from '@/api/logs'

export const log = {
  debug(message: string, meta?: unknown): void {
    sendLog(LogLevel.Debug, message, meta)
  },
  info(message: string, meta?: unknown): void {
    sendLog(LogLevel.Info, message, meta)
  },
  warn(message: string, meta?: unknown): void {
    sendLog(LogLevel.Warn, message, meta)
  },
  error(message: string, meta?: unknown): void {
    sendLog(LogLevel.Error, message, meta)
  },
}
