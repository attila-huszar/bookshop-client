import { i18n } from '@/i18n'
import { toAppError } from '@/helpers/errors'
import { defaultCountry } from '@/constants/defaultValues'
import type { LoginRequest, LoginResponse } from '@/types'
import { baseRequest } from './baseRequest'
import { PATH } from './path'

export const retrieveAuthTokens = () =>
  baseRequest
    .post(PATH.users.refresh, { credentials: 'include' })
    .json<{ accessToken: string | null }>()

export const postUserLogin = async ({ email, password }: LoginRequest) => {
  try {
    return await baseRequest
      .post(PATH.users.login, {
        json: { email, password },
        credentials: 'include',
      })
      .json<LoginResponse>()
  } catch (error) {
    throw toAppError(error, i18n.t('auth.loginError'))
  }
}

export const postUserLogout = async () => {
  try {
    return await baseRequest
      .post(PATH.users.logout, { credentials: 'include' })
      .json<{ success: boolean }>()
  } catch (error) {
    throw toAppError(error, i18n.t('auth.logoutError'))
  }
}

export const postVerifyEmail = sharePendingTokenRequest((token) =>
  baseRequest
    .post(PATH.users.verification, { json: { token } })
    .json<{ email: string }>(),
)

export const postPasswordReset = (email: string) =>
  baseRequest
    .post(PATH.users.passwordResetRequest, { json: { email } })
    .json<{ success: boolean }>()

export const postVerifyPasswordReset = sharePendingTokenRequest((token) =>
  baseRequest
    .post(PATH.users.passwordResetToken, { json: { token } })
    .json<{ token: string }>(),
)

export const postPasswordResetSubmit = (token: string, password: string) =>
  baseRequest
    .post(PATH.users.passwordResetSubmit, { json: { token, password } })
    .json<{ success: boolean }>()

export const getUserCountry = async () => {
  try {
    const { country } = await baseRequest
      .get(PATH.users.country)
      .json<{ country?: string }>()

    return { country: country ?? defaultCountry }
  } catch {
    return { country: defaultCountry }
  }
}

/** Share pending requests per token without caching success or failure. */
function sharePendingTokenRequest<T>(send: (token: string) => Promise<T>) {
  const pending = new Map<string, Promise<T>>()

  return (token: string) => {
    const existing = pending.get(token)

    if (existing) {
      return existing
    }

    const request = send(token).finally(() => {
      pending.delete(token)
    })

    pending.set(token, request)

    return request
  }
}
