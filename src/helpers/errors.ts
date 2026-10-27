import { i18n } from '@/i18n'
import type { ParseKeys } from 'i18next'
import { isHTTPError, isKyError, isNetworkError, isTimeoutError } from 'ky'
import {
  type ApiError,
  type ApiValidationIssue,
  AuthErrorCode,
  type ErrorCode,
  HttpErrorCode,
  PaymentErrorCode,
  TermsErrorCode,
  UserErrorCode,
  ValidationRule,
} from '@/types/ApiError'

const apiErrorKeys = {
  [HttpErrorCode.BadRequest]: 'errors.badRequest',
  [HttpErrorCode.Unauthorized]: 'errors.unauthorized',
  [HttpErrorCode.Forbidden]: 'errors.forbidden',
  [HttpErrorCode.NotFound]: 'errors.notFound',
  [HttpErrorCode.Internal]: 'common.error',
  [HttpErrorCode.InvalidJson]: 'errors.invalidJson',
  [HttpErrorCode.PayloadTooLarge]: 'errors.payloadTooLarge',
  [HttpErrorCode.RateLimited]: 'errors.rateLimited',
  [HttpErrorCode.Timeout]: 'errors.timeout',
  [AuthErrorCode.InvalidCredentials]: 'errors.invalidCredentials',
  [AuthErrorCode.EmailUnverified]: 'errors.emailUnverified',
  [UserErrorCode.EmailAlreadyExists]: 'errors.emailAlreadyExists',
  [AuthErrorCode.InvalidToken]: 'errors.invalidToken',
  [AuthErrorCode.CurrentPasswordIncorrect]: 'errors.currentPasswordIncorrect',
  [UserErrorCode.LastAdminRequired]: 'errors.lastAdminRequired',
  [UserErrorCode.InvalidImage]: 'validation.image',
  [PaymentErrorCode.AccessDenied]: 'checkout.sessionUnavailable',
  [PaymentErrorCode.PriceConflict]: 'checkout.priceChanged',
  [PaymentErrorCode.CheckoutEnded]: 'checkout.sessionEnded',
  [TermsErrorCode.Unavailable]: 'terms.unavailable',
  [TermsErrorCode.InUse]: 'termsEditor.inUse',
  [TermsErrorCode.Changed]: 'errors.termsChanged',
  [TermsErrorCode.AlreadyAccepted]: 'errors.termsAlreadyAccepted',
  [TermsErrorCode.NotRecorded]: 'errors.termsNotRecorded',
  [PaymentErrorCode.AlreadyCanceled]: 'payment.status.canceled',
  [PaymentErrorCode.AlreadySucceeded]: 'errors.paymentAlreadySucceeded',
  [HttpErrorCode.Validation]: 'errors.validation',
  [HttpErrorCode.UnknownResponse]: undefined,
} as const satisfies Record<ErrorCode, ParseKeys | undefined>

const customValidationKeys = {
  [ValidationRule.CurrentPasswordRequired]: 'validation.required',
  [ValidationRule.Decimal]: 'validation.decimal',
  [ValidationRule.FilterRange]: 'validation.filterRange',
  [ValidationRule.ImageRequired]: 'validation.imageRequired',
} as const satisfies Record<ValidationRule, ParseKeys>

const validationFieldKeys = {
  firstName: 'common.fields.firstName',
  lastName: 'common.fields.lastName',
  email: 'common.fields.email',
  password: 'common.fields.password',
  currentPassword: 'auth.currentPassword',
  country: 'common.fields.country',
  phone: 'common.fields.phone',
  address: 'common.fields.address',
  city: 'common.fields.city',
  line1: 'common.fields.line1',
  line2: 'common.fields.line2',
  state: 'common.fields.state',
  postal_code: 'common.fields.postalCode',
  role: 'common.fields.role',
  avatar: 'common.fields.avatar',
  title: 'common.fields.title',
  authorId: 'common.fields.author',
  genre: 'common.fields.genre',
  description: 'common.fields.description',
  publishYear: 'common.fields.publishYear',
  rating: 'common.fields.rating',
  price: 'common.fields.price',
  discount: 'common.fields.discount',
  discountPrice: 'common.fields.discountPrice',
  quantity: 'common.fields.quantity',
  total: 'common.fields.total',
  currency: 'common.fields.currency',
  items: 'common.fields.items',
  imgUrl: 'common.fields.imageUrl',
} as const satisfies Record<string, ParseKeys>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Check known enum values against the exhaustive translation map, excluding inherited keys. */
function isErrorCode(code: string): code is ErrorCode {
  return Object.hasOwn(apiErrorKeys, code)
}

/** Validate an issue's required shape and copy only supported public metadata. */
function normalizeValidationIssue(
  value: unknown,
): ApiValidationIssue | undefined {
  if (
    !isRecord(value) ||
    typeof value.code !== 'string' ||
    !Array.isArray(value.path) ||
    !value.path.every(
      (part) => typeof part === 'string' || typeof part === 'number',
    )
  ) {
    return undefined
  }

  const issue: ApiValidationIssue = { path: [...value.path], code: value.code }

  for (const key of ['origin', 'expected', 'format'] as const) {
    if (typeof value[key] === 'string') {
      issue[key] = value[key]
    }
  }

  for (const key of ['minimum', 'maximum'] as const) {
    if (typeof value[key] === 'number' && Number.isFinite(value[key])) {
      issue[key] = value[key]
    }
  }

  if (typeof value.inclusive === 'boolean') {
    issue.inclusive = value.inclusive
  }

  if (isRecord(value.params) && typeof value.params.rule === 'string') {
    issue.params = { rule: value.params.rule }
  }

  return issue
}

/**
 * Extract language-independent API details from Ky failures or coded objects.
 * Unknown string codes, unrecognized HTTP bodies, and network failures become
 * UnknownResponse; timeouts become Timeout. Only public validation metadata survives.
 * No translation or logging occurs here.
 *
 * @returns Serializable details, or undefined when no API/transport failure is recognized.
 */
export function getApiError(value: unknown): ApiError | undefined {
  if (isHTTPError(value)) {
    return getApiError(value.data) ?? { code: HttpErrorCode.UnknownResponse }
  }

  if (isTimeoutError(value)) {
    return { code: HttpErrorCode.Timeout }
  }

  if (isNetworkError(value)) {
    return { code: HttpErrorCode.UnknownResponse }
  }

  if (!isRecord(value) || typeof value.code !== 'string') {
    return undefined
  }

  return {
    code: isErrorCode(value.code) ? value.code : HttpErrorCode.UnknownResponse,
    ...(Array.isArray(value.validation)
      ? {
          validation: value.validation
            .map(normalizeValidationIssue)
            .filter((issue) => issue !== undefined),
        }
      : {}),
  }
}

/** Select translated wording from native Zod metadata, falling back for unknown rules. */
function validationKey(issue: ApiValidationIssue): ParseKeys {
  switch (issue.code) {
    case 'too_small':
      if (issue.minimum === undefined) {
        return 'validation.type'
      }
      if (issue.origin === 'string') {
        return 'validation.minLength'
      }
      if (issue.origin === 'array') {
        return 'validation.minItems'
      }

      return issue.inclusive === false
        ? 'validation.greaterThan'
        : 'validation.minimum'

    case 'too_big':
      if (issue.maximum === undefined) {
        return 'validation.type'
      }
      if (issue.origin === 'string') {
        return 'validation.maxLength'
      }
      if (issue.origin === 'array') {
        return 'validation.maxItems'
      }

      return issue.inclusive === false
        ? 'validation.lessThan'
        : 'validation.maximum'

    case 'invalid_type':
      return issue.expected === 'int' ? 'validation.integer' : 'validation.type'

    case 'invalid_format':
      if (issue.format === 'email') {
        return 'validation.email'
      }
      if (issue.format === 'url') {
        return 'validation.url'
      }
      if (issue.format === 'regex') {
        switch (issue.path.at(-1)) {
          case 'country':
            return 'validation.country'
          case 'phone':
            return 'validation.phone'
          case 'password':
            return 'validation.passwordFormat'
        }
      }

      return 'validation.type'

    case 'invalid_value':
      return issue.path.at(-1) === 'accepted'
        ? 'terms.required'
        : 'validation.type'

    case 'custom': {
      const rule = issue.params?.rule

      return rule && Object.hasOwn(customValidationKeys, rule)
        ? customValidationKeys[rule as keyof typeof customValidationKeys]
        : 'validation.type'
    }

    default:
      return 'validation.type'
  }
}

/** Translate one issue in the current language and prefix a known field label. */
function validationMessage(issue: ApiValidationIssue): string {
  const message = i18n.t(validationKey(issue), {
    min: issue.minimum,
    max: issue.maximum,
  })
  const field = issue.path.at(-1)
  const fieldKey =
    typeof field === 'string' && Object.hasOwn(validationFieldKeys, field)
      ? validationFieldKeys[field as keyof typeof validationFieldKeys]
      : undefined

  return fieldKey ? `${i18n.t(fieldKey)}: ${message}` : message
}

/**
 * Read a raw string/number code without validating, translating, or normalizing it.
 * Use for generic workflow checks; use getApiError for a typed API ErrorCode.
 */
export function getErrorCode(error: unknown): string | number | undefined {
  if (!isRecord(error)) {
    return undefined
  }

  return typeof error.code === 'string' || typeof error.code === 'number'
    ? error.code
    : undefined
}

/**
 * Resolve display text using the current i18n language and normalized API details.
 * API/server messages are ignored. Unknown codes and runtime transport/JSON errors
 * use the caller's fallback; nonempty messages on other errors/objects are preserved.
 * Call again at display time to reflect a language change; this does not subscribe to it.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  const apiError = getApiError(error)

  if (apiError) {
    if (
      apiError.code === HttpErrorCode.Validation &&
      apiError.validation?.length
    ) {
      return [...new Set(apiError.validation.map(validationMessage))].join(', ')
    }

    const key = apiErrorKeys[apiError.code]

    return key ? i18n.t(key) : fallback
  }

  if (
    !isRecord(error) ||
    isKyError(error) ||
    error.name === 'TypeError' ||
    error.name === 'SyntaxError'
  ) {
    return fallback
  }

  return typeof error.message === 'string' && error.message.trim().length > 0
    ? error.message
    : fallback
}

/**
 * Wrap a failure for rethrowing with display text, normalized API details, and cause.
 * The message uses the current language; retained codes allow later retranslation.
 * Does not log. Use getErrorMessage when only displaying an existing failure.
 */
export function toAppError(
  error: unknown,
  fallback = i18n.t('common.unexpectedError'),
): Error & Partial<ApiError> {
  return Object.assign(
    new Error(getErrorMessage(error, fallback), { cause: error }),
    getApiError(error),
  )
}
