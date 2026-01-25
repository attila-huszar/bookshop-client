import { baseRequest } from './baseRequest'
import { PATH } from './path'

export const enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

const serialize = (value: unknown): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    }
  }

  if (Array.isArray(value)) {
    return value.map(serialize)
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serialize(v)]),
    )
  }

  return value
}

export function sendLog(
  level: LogLevel,
  message: string,
  meta?: unknown,
): void {
  void baseRequest
    .post(PATH.logs, {
      json: {
        level,
        message,
        meta: serialize(meta),
      },
    })
    .catch(() => null)
}
