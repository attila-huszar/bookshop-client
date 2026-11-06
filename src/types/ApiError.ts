/** HTTP/transport failure codes, including the client's unknown-response fallback. */
export const enum HttpErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Internal = 'INTERNAL_ERROR',
  InvalidJson = 'INVALID_JSON',
  PayloadTooLarge = 'PAYLOAD_TOO_LARGE',
  RateLimited = 'RATE_LIMITED',
  Timeout = 'REQUEST_TIMEOUT',
  Validation = 'VALIDATION_ERROR',
  /** Client fallback for unrecognized API codes, response bodies, or network failures. */
  UnknownResponse = 'UNKNOWN_API_ERROR',
}

/** Authentication failures returned by the server, independent of UI language. */
export const enum AuthErrorCode {
  InvalidCredentials = 'INVALID_CREDENTIALS',
  EmailUnverified = 'EMAIL_UNVERIFIED',
  InvalidToken = 'INVALID_TOKEN',
  CurrentPasswordIncorrect = 'CURRENT_PASSWORD_INCORRECT',
}

/** Account/profile failures returned by the server. */
export const enum UserErrorCode {
  EmailAlreadyExists = 'EMAIL_ALREADY_EXISTS',
  LastAdminRequired = 'LAST_ADMIN_REQUIRED',
  InvalidImage = 'INVALID_IMAGE',
}

/** Checkout access, pricing, and payment lifecycle failures returned by the server. */
export const enum PaymentErrorCode {
  AccessDenied = 'PAYMENT_ACCESS_DENIED',
  PriceConflict = 'PRICE_CONFLICT',
  CheckoutEnded = 'CHECKOUT_ENDED',
  AlreadyCanceled = 'PAYMENT_ALREADY_CANCELED',
  AlreadySucceeded = 'PAYMENT_ALREADY_SUCCEEDED',
}

/** Terms availability, version, and acceptance failures returned by the server. */
export const enum TermsErrorCode {
  InUse = 'TERMS_IN_USE',
  Unavailable = 'TERMS_UNAVAILABLE',
  Changed = 'TERMS_CHANGED',
  AlreadyAccepted = 'TERMS_ALREADY_ACCEPTED',
  NotRecorded = 'TERMS_NOT_RECORDED',
}

/** App-specific validation identifiers carried in a Zod custom issue's `params.rule`. */
export const enum ValidationRule {
  CurrentPasswordRequired = 'CURRENT_PASSWORD_REQUIRED',
  Decimal = 'DECIMAL',
  FilterRange = 'FILTER_RANGE',
  ImageRequired = 'IMAGE_REQUIRED',
}

/** Known application error codes; native Zod issue codes are separate. */
export type ErrorCode =
  | HttpErrorCode
  | AuthErrorCode
  | UserErrorCode
  | PaymentErrorCode
  | TermsErrorCode

/**
 * Public Zod issue metadata used to build translated field messages.
 * `code` stays a string to accept native/future Zod codes; custom rules use
 * `params.rule`. Server message text and submitted input are excluded.
 */
export type ApiValidationIssue = {
  path: (string | number)[]
  code: string
  origin?: string
  minimum?: number
  maximum?: number
  inclusive?: boolean
  expected?: string
  format?: string
  params?: { rule?: string }
}

/**
 * Normalized, serializable API failure for state and translation at display time.
 * `getApiError` maps unrecognized incoming codes to `HttpErrorCode.UnknownResponse`.
 * Store these details rather than an Error instance or a translated message.
 */
export type ApiError = {
  code: ErrorCode
  validation?: ApiValidationIssue[]
}
