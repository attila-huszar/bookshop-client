import { i18n } from '@/i18n'
import ky, { NetworkError, TimeoutError } from 'ky'
import { describe, expect, it, vi } from 'vitest'
import { log } from '@/services/logger'
import {
  AuthErrorCode,
  HttpErrorCode,
  PaymentErrorCode,
  TermsErrorCode,
  UserErrorCode,
} from '@/types/ApiError'
import en from '../../public/locales/en/translation.json'
import hu from '../../public/locales/hu/translation.json'
import {
  getApiError,
  getErrorCode,
  getErrorMessage,
  toAppError,
} from './errors'

async function requestFailure(body: unknown) {
  try {
    await ky.get('https://bookshop.test/api', {
      retry: 0,
      fetch: () =>
        Promise.resolve(
          new Response(JSON.stringify(body), {
            status: 400,
            headers: { 'content-type': 'application/json' },
          }),
        ),
    })
  } catch (error) {
    return error
  }

  throw new Error('Expected an HTTP error')
}

describe('toAppError', () => {
  it('preserves validation details and the original cause without logging again', async () => {
    const failure = await requestFailure({
      code: 'VALIDATION_ERROR',
      validation: [
        { path: ['email'], code: 'invalid_format', format: 'email' },
      ],
    })
    const wrapped = toAppError(failure)
    const rethrown = toAppError(wrapped)

    expect(wrapped.cause).toBe(failure)
    expect(rethrown.cause).toBe(wrapped)
    expect(getApiError(rethrown)).toEqual(getApiError(failure))

    await i18n.changeLanguage('hu')

    expect(getErrorMessage(rethrown, 'Fallback')).toBe(
      `${hu.common.fields.email}: ${hu.validation.email}`,
    )
    expect(vi.spyOn(log, 'warn')).not.toHaveBeenCalled()
    expect(vi.spyOn(log, 'error')).not.toHaveBeenCalled()
  })

  it('preserves local error messages and their cause', () => {
    const cause = new Error('Card declined')
    const error = toAppError(cause, 'Fallback')

    expect(error.message).toBe('Card declined')
    expect(error.cause).toBe(cause)
  })

  it('keeps transport failures translatable after wrapping and serialization', async () => {
    const request = new Request('https://bookshop.test/api')
    const network = new NetworkError(request, {
      cause: new TypeError('Failed to fetch'),
    })
    const timeout = new TimeoutError(request)
    const wrapped = toAppError(network, en.common.requestFailed)

    expect(wrapped.cause).toBe(network)
    expect(wrapped.message).toBe(en.common.requestFailed)
    expect(getApiError(wrapped)).toEqual({ code: 'UNKNOWN_API_ERROR' })
    expect(toAppError(timeout).cause).toBe(timeout)

    await i18n.changeLanguage('hu')

    expect(
      getErrorMessage(
        JSON.parse(JSON.stringify(wrapped)),
        hu.common.requestFailed,
      ),
    ).toBe(hu.common.requestFailed)
    expect(getErrorMessage(toAppError(timeout), 'Fallback')).toBe(
      hu.errors.timeout,
    )
  })

  it('preserves the code through formatting for later translation', async () => {
    const failure = await requestFailure({ code: 'INVALID_CREDENTIALS' })
    const formatted = toAppError(failure)
    expect(formatted.cause).toBe(failure)
    expect(formatted.message).toBe(en.errors.invalidCredentials)
    expect(formatted.code).toBe('INVALID_CREDENTIALS')

    await i18n.changeLanguage('hu')

    expect(getErrorMessage(formatted, 'Fallback')).toBe(
      hu.errors.invalidCredentials,
    )
  })

  it.each([
    { code: 'FUTURE_ERROR', error: 'Private details' },
    { error: 'Old server sentence' },
    { message: 'Proxy details' },
    'Proxy details',
    null,
  ])(
    'uses the translated fallback for an unknown HTTP response: %j',
    async (body) => {
      await i18n.changeLanguage('hu')
      const error = await requestFailure(body)

      expect(toAppError(error).message).toBe(hu.common.unexpectedError)
    },
  )
})

describe('getApiError', () => {
  it('drops malformed issues and optional metadata without trusting their declared shape', () => {
    expect(
      getApiError({
        code: 'VALIDATION_ERROR',
        validation: [
          null,
          { code: 42, path: [] },
          { code: 'invalid_type', path: ['email', {}] },
          {
            code: 'too_small',
            path: ['price'],
            origin: 42,
            expected: null,
            format: [],
            minimum: NaN,
            maximum: Infinity,
            inclusive: 'true',
            params: { rule: 42 },
            message: 'Private details',
          },
          {
            code: 'custom',
            path: ['price'],
            params: { rule: 'DECIMAL', input: 'Private details' },
          },
        ],
      }),
    ).toEqual({
      code: HttpErrorCode.Validation,
      validation: [
        { code: 'too_small', path: ['price'] },
        { code: 'custom', path: ['price'], params: { rule: 'DECIMAL' } },
      ],
    })
  })

  it('retains valid optional metadata, including zero bounds and exclusive limits', () => {
    const issue = {
      code: 'too_small',
      path: ['items', 0, 'quantity'],
      origin: 'number',
      expected: 'int',
      format: 'regex',
      minimum: 0,
      maximum: 10,
      inclusive: false,
    }

    expect(
      getApiError({ code: 'VALIDATION_ERROR', validation: [issue] }),
    ).toEqual({
      code: HttpErrorCode.Validation,
      validation: [issue],
    })
  })

  it.each([
    ['BAD_REQUEST', HttpErrorCode.BadRequest],
    ['INVALID_CREDENTIALS', AuthErrorCode.InvalidCredentials],
    ['EMAIL_ALREADY_EXISTS', UserErrorCode.EmailAlreadyExists],
    ['PRICE_CONFLICT', PaymentErrorCode.PriceConflict],
    ['TERMS_CHANGED', TermsErrorCode.Changed],
    ['UNKNOWN_API_ERROR', HttpErrorCode.UnknownResponse],
  ])('recognizes the API code %s', (incoming, expected) => {
    expect(getApiError({ code: incoming })).toEqual({ code: expected })
  })

  it.each(['FUTURE_ERROR', '__proto__', 'constructor', 'toString', ''])(
    'normalizes unknown code %j without exposing the raw message',
    async (code) => {
      const failure = await requestFailure({ code, message: 'Private details' })
      const wrapped = toAppError(failure, 'Fallback')

      expect(getApiError(failure)).toEqual({
        code: HttpErrorCode.UnknownResponse,
      })
      expect(wrapped.code).toBe(HttpErrorCode.UnknownResponse)
      expect(wrapped.cause).toBe(failure)
      expect(getErrorMessage(wrapped, 'Fallback')).toBe('Fallback')
    },
  )
})

describe('getErrorCode', () => {
  it.each(['session_unavailable', 11000, 0, ''])(
    'preserves code %j',
    (code) => {
      expect(getErrorCode({ code })).toBe(code)
      expect(
        getErrorCode(Object.assign(new Error('Request failed'), { code })),
      ).toBe(code)
    },
  )

  it.each([
    null,
    undefined,
    'session_unavailable',
    42,
    {},
    [],
    Object.assign([], { code: 'session_unavailable' }),
    new Error(),
    { code: null },
    { code: undefined },
    { code: true },
    { code: {} },
  ])('returns undefined for missing or unsupported codes: %j', (error) => {
    expect(getErrorCode(error)).toBeUndefined()
  })
})

describe('getErrorMessage', () => {
  it.each([
    new TypeError('Failed to fetch'),
    new SyntaxError('Unexpected token in JSON'),
  ])('uses the translated fallback for runtime failures: %j', async (error) => {
    await i18n.changeLanguage('hu')

    expect(getErrorMessage(error, i18n.t('common.requestFailed'))).toBe(
      hu.common.requestFailed,
    )
  })

  it.each([
    [
      { code: 'too_small', origin: 'string', minimum: 6, inclusive: true },
      'Min 6 characters',
    ],
    [
      { code: 'too_big', origin: 'array', maximum: 3, inclusive: true },
      'Select no more than 3 items',
    ],
    [
      { code: 'too_small', origin: 'number', minimum: 0, inclusive: false },
      'Must be greater than 0',
    ],
    [
      { code: 'too_big', origin: 'number', maximum: 10, inclusive: false },
      'Must be less than 10',
    ],
    [{ code: 'invalid_type', expected: 'int' }, 'Must be integer'],
    [{ code: 'custom', params: { rule: 'DECIMAL' } }, 'Max 1 decimal'],
  ])('translates native Zod metadata %j', (issue, expected) => {
    expect(
      getErrorMessage(
        {
          code: 'VALIDATION_ERROR',
          validation: [{ path: [], ...issue }],
        },
        'Fallback',
      ),
    ).toBe(expected)
  })

  it('keeps only public native issue metadata when normalizing an API error', () => {
    expect(
      getApiError({
        code: 'VALIDATION_ERROR',
        validation: [
          {
            code: 'too_big',
            path: ['items', 0, 'quantity'],
            origin: 'number',
            maximum: 10,
            inclusive: true,
            input: 'Private input',
            message: 'English message',
            pattern: 'Internal pattern',
          },
        ],
      }),
    ).toEqual({
      code: 'VALIDATION_ERROR',
      validation: [
        {
          code: 'too_big',
          path: ['items', 0, 'quantity'],
          origin: 'number',
          maximum: 10,
          inclusive: true,
        },
      ],
    })
  })

  it('reads messages from Error instances', () => {
    expect(getErrorMessage(new Error('Request failed'), 'Fallback')).toBe(
      'Request failed',
    )
  })

  it('reads messages from plain rejection objects without altering them', () => {
    expect(getErrorMessage({ message: ' Request failed ' }, 'Fallback')).toBe(
      ' Request failed ',
    )
  })

  it('translates stable API codes again after changing language', async () => {
    const error = { code: 'EMAIL_ALREADY_EXISTS', message: 'Technical details' }
    expect(getErrorMessage(error, 'Fallback')).toBe(
      en.errors.emailAlreadyExists,
    )

    await i18n.changeLanguage('hu')

    expect(getErrorMessage(error, 'Fallback')).toBe(
      hu.errors.emailAlreadyExists,
    )
    expect(error.message).toBe('Technical details')
  })

  it('translates validation paths and limits without using server sentences', async () => {
    const error = {
      code: 'VALIDATION_ERROR',
      validation: [
        {
          path: ['email'],
          code: 'invalid_format',
          origin: 'string',
          format: 'email',
          message: 'English server details',
        },
        {
          path: ['items', 0, 'quantity'],
          code: 'too_big',
          origin: 'number',
          maximum: 10,
          inclusive: true,
        },
      ],
    }
    expect(getErrorMessage(error, 'Fallback')).toBe(
      'Email: Invalid Email, Quantity: Max 10',
    )

    await i18n.changeLanguage('hu')

    expect(getErrorMessage(error, 'Fallback')).toBe(
      `${hu.common.fields.email}: ${hu.validation.email}, ${hu.common.fields.quantity}: ${i18n.t('validation.maximum', { max: 10 })}`,
    )
  })

  it('uses a local fallback for unknown API codes, even when a raw message exists', () => {
    expect(
      getErrorMessage(
        { code: 'FUTURE_ERROR', message: 'Private details' },
        'Fallback',
      ),
    ).toBe('Fallback')
    expect(
      getErrorMessage(
        { code: '__proto__', message: 'Private details' },
        'Fallback',
      ),
    ).toBe('Fallback')
  })

  it('handles unknown and malformed validation issues without exposing their messages', () => {
    expect(
      getErrorMessage(
        {
          code: 'VALIDATION_ERROR',
          validation: [
            null,
            {
              path: ['email'],
              code: 'FUTURE_RULE',
              message: 'Private details',
            },
            {
              path: ['price'],
              code: 'too_small',
              origin: 'number',
              minimum: 'Private details',
            },
          ],
        },
        'Fallback',
      ),
    ).toBe('Email: Invalid value, Price: Invalid value')
  })

  it.each([
    null,
    undefined,
    'Thrown string',
    42,
    {},
    { message: 42 },
    { message: null },
    { message: {} },
    { message: '' },
    { message: '   ' },
    new Error(),
  ])('uses the supplied fallback for an unusable message: %j', (error) => {
    expect(getErrorMessage(error, 'Please try again')).toBe('Please try again')
  })
})
