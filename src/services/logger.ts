import { sendLog } from '@/api/logs'

class Logger {
  info(message: string, meta?: object): void {
    void sendLog('info', message, meta)
  }

  error(message: string, meta?: object): void {
    void sendLog('error', message, meta)
  }

  warn(message: string, meta?: object): void {
    void sendLog('warn', message, meta)
  }
}

export const log = new Logger()
