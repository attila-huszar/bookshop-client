import { describe, expect, it } from 'vitest'
import { getErrorCode, getErrorMessage } from './errors'

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
  it('reads messages from Error instances', () => {
    expect(getErrorMessage(new Error('Request failed'), 'Fallback')).toBe(
      'Request failed',
    )
  })

  it('reads messages from plain rejection objects without altering them', () => {
    expect(
      getErrorMessage(
        { message: ' Request failed ', code: 'FAILED' },
        'Fallback',
      ),
    ).toBe(' Request failed ')
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
