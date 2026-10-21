import { isHTTPError, isTimeoutError } from 'ky'
import { log } from '@/services/logger'
import { transport } from './transport'

const loggedErrors = new WeakSet<Error>()

export const baseRequest = transport.extend({
  hooks: {
    beforeError: [
      ({ error, request }) => {
        if (
          error.name === 'AbortError' ||
          (request.signal.aborted && !isTimeoutError(error)) ||
          loggedErrors.has(error)
        ) {
          return error
        }

        loggedErrors.add(error)

        const meta = {
          method: request.method,
          path: new URL(request.url).pathname,
          ...(isHTTPError(error)
            ? { status: error.response.status, error: error.data }
            : { name: error.name }),
        }

        if (isHTTPError(error) && error.response.status < 500) {
          log.warn('HTTP request failed', meta)
        } else {
          log.error('Request failed', meta)
        }

        return error
      },
    ],
  },
})
