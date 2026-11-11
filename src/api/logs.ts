import { PATH } from './path'
import { transport } from './transport'

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

const enum LogLevel {
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

function sendLog(level: LogLevel, message: string, meta?: unknown): void {
  void transport
    .post(PATH.logs, {
      json: {
        level,
        message,
        meta: serialize(meta),
      },
    })
    .catch(() => null)
}
