import { Logtail } from '@logtail/browser'
import { ErrorInfo } from 'react'

class Logger {
  private logtail: Logtail

  constructor() {
    this.logtail = new Logtail(import.meta.env.VITE_LOGTAIL_SOURCE_TOKEN, {
      endpoint: import.meta.env.VITE_LOGTAIL_INGESTING_HOST,
    })
  }

  info(message: string, context?: Record<string, unknown>) {
    void this.logtail.info(message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    void this.logtail.warn(message, context)
  }

  error(error: unknown, context?: ErrorInfo) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined

    void this.logtail.error(message, { ...context, stack })
  }

  async flush() {
    await this.logtail.flush()
  }
}

export const logger = new Logger()
