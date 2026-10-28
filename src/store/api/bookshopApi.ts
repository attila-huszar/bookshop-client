import type { BaseQueryApi } from '@reduxjs/toolkit/query'
import { createApi } from '@reduxjs/toolkit/query/react'
import { isHTTPError, type Options } from 'ky'
import { authRequest } from '@/api/authRequest'
import { baseRequest } from '@/api/baseRequest'
import { getApiError } from '@/helpers/errors'
import { HttpErrorCode } from '@/types/ApiError'

type QueryArgs = Options & {
  url: string
  /** Use token/refresh handling, including cookie-based guest checkout. */
  withAuth?: boolean
}

/** Adapt Ky results and retain structured error codes for display-time translation. */
const baseQuery = async (args: QueryArgs, { signal }: BaseQueryApi) => {
  const { url, withAuth = false, ...options } = args

  try {
    const client = withAuth ? authRequest : baseRequest
    const response = await client(url, { ...options, signal })
    const data = response.status === 204 ? null : await response.json<unknown>()

    return { data, meta: { response } }
  } catch (error: unknown) {
    return {
      error: {
        ...(getApiError(error) ?? { code: HttpErrorCode.UnknownResponse }),
        ...(isHTTPError(error) ? { status: error.response.status } : {}),
      },
    }
  }
}

/** One server-data cache. Ky still owns cookies and single-flight token refresh. */
export const bookshopApi = createApi({
  reducerPath: 'bookshopApi',
  baseQuery,
  tagTypes: [
    'Book',
    'Author',
    'News',
    'Order',
    'User',
    'Profile',
    'CheckoutTerms',
    'TermsDocument',
  ],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
})
