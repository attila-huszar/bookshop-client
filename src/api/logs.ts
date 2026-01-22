import { baseRequest } from './baseRequest'
import { PATH } from './path'

export const enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export function sendLog(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
): void {
  void baseRequest
    .post(PATH.logs, {
      json: { level, message, meta },
    })
    .catch(() => undefined)
}
