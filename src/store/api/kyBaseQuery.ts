import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { HTTPError, type Options } from 'ky'
import { authRequest } from '@/api/authRequest'
import { baseRequest } from '@/api/baseRequest'
import { getErrorMessage } from '@/helpers/errors'
import { handleError } from '@/errors'

type KyQueryArgs = Pick<
  Options,
  'json' | 'body' | 'searchParams' | 'credentials' | 'headers'
> & {
  url: string
  method?: 'get' | 'post' | 'patch' | 'put' | 'delete'
  authenticated?: boolean
}

type QueryError = { message: string; status?: number }
type QueryMeta = { response: Response }

/** Reuse Ky's transport/auth hooks; RTK Query owns caching and cancellation. */
export const kyBaseQuery: BaseQueryFn<
  KyQueryArgs,
  unknown,
  QueryError,
  object,
  QueryMeta
> = async (args, api) => {
  const { url, method = 'get', authenticated = false, ...options } = args

  try {
    const client = authenticated ? authRequest : baseRequest
    const response = await client[method](url, {
      ...options,
      signal: api.signal,
    })
    const data = response.status === 204 ? null : await response.json<unknown>()

    return { data, meta: { response } }
  } catch (error: unknown) {
    return {
      error: {
        message:
          error instanceof HTTPError
            ? handleError({ error, message: 'Request failed' }).message
            : getErrorMessage(error, 'Request failed'),
        ...(error instanceof HTTPError
          ? { status: error.response.status }
          : {}),
      },
    }
  }
}
