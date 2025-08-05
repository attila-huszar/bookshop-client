import { Logger } from 'seq-logging/browser'

const createLogger = () => {
  const seq = new Logger({
    serverUrl: import.meta.env.VITE_SEQ_URL,
    apiKey: import.meta.env.VITE_SEQ_API_KEY,
    onError: (error) => console.error('❌ Seq error:', error.message),
  })

  return {
    info: (message: string, properties?: Record<string, unknown>) => {
      seq.emit({
        timestamp: new Date(),
        level: 'Information',
        messageTemplate: message,
        properties: properties ?? {},
      })
    },

    warn: (message: string, properties?: Record<string, unknown>) => {
      seq.emit({
        timestamp: new Date(),
        level: 'Warning',
        messageTemplate: message,
        properties: properties ?? {},
      })
    },

    error: (message: string, properties?: Record<string, unknown>) => {
      seq.emit({
        timestamp: new Date(),
        level: 'Error',
        messageTemplate: message,
        properties: properties ?? {},
      })
    },

    debug: (message: string, properties?: Record<string, unknown>) => {
      seq.emit({
        timestamp: new Date(),
        level: 'Debug',
        messageTemplate: message,
        properties: properties ?? {},
      })
    },

    flush: () => seq.flush(),
    close: () => seq.close(),
  } as const
}

export const log = createLogger()
