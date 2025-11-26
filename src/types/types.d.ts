declare module '*.lottie' {
  const src: string
  export default src
}

declare module 'seq-logging/browser' {
  export type SeqLevel =
    | 'Verbose'
    | 'Debug'
    | 'Information'
    | 'Warning'
    | 'Error'
    | 'Fatal'

  export interface SeqEmitOptions {
    timestamp: Date
    level: SeqLevel
    messageTemplate: string
    properties?: Record<string, unknown>
  }

  export interface SeqLoggerOptions {
    serverUrl: string
    apiKey?: string
    onError?: (error: Error) => void
  }

  export class Logger {
    constructor(options: SeqLoggerOptions)
    emit(event: SeqEmitOptions): void
    flush(): void
    close(): void
  }
}

type RejectValue = { rejectValue: string }
type Toast = string
