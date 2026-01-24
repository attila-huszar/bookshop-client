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
  const serialize = (val: unknown): Record<string, unknown> => {
    if (val instanceof Error) {
      return {
        name: val.name,
        message: val.message,
        stack: val.stack,
      }
    }

    if (val !== null && typeof val === 'object') {
      return Object.fromEntries(
        Object.entries(val).map(([k, v]) => [k, serialize(v)]),
      )
    }

    return val as Record<string, unknown>
  }

  const cleanMeta = meta ? serialize(meta) : null

  void baseRequest
    .post(PATH.logs, {
      json: {
        level,
        message,
        ...(cleanMeta ? { meta: cleanMeta } : {}),
      },
    })
    .catch(() => null)
}
