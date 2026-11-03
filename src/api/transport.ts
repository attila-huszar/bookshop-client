import ky from 'ky'
import { httpPolicy } from '@/constants/http'
import { PATH } from './path'

/** Log uploads use this transport without the application's error logging hook. */
export const transport = ky.create({
  prefix: import.meta.env.PROD ? import.meta.env.VITE_SERVER_URL : PATH.api,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: httpPolicy.requestTimeoutMs,
  retry: {
    limit: httpPolicy.retryLimit,
    statusCodes: [408, 413, 500, 502, 503, 504],
  },
})
