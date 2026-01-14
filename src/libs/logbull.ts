import { LogBullLogger, LogLevel } from 'logbull'
import { logbullApiKey, logbullHost, logbullProjectId } from '@/constants'

export const log = new LogBullLogger({
  host: logbullHost,
  projectId: logbullProjectId,
  apiKey: logbullApiKey,
  logLevel: LogLevel.INFO,
})
