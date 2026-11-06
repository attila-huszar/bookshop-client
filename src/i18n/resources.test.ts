import { createInstance } from 'i18next'
import { describe, expect, it } from 'vitest'
import en from '../../public/locales/en/translation.json'
import hu from '../../public/locales/hu/translation.json'

function flatten(
  resource: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(resource)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      result[path] = value
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value as Record<string, unknown>, path))
    }
  }

  return result
}

describe('interface translations', () => {
  it.each([
    ['en', 0, '0 emails · Page 1 of 1'],
    ['en', 1, '1 email · Page 1 of 1'],
    ['en', 2, '2 emails · Page 1 of 1'],
    ['hu', 0, '0 e-mail · 1. oldal / 1'],
    ['hu', 1, '1 e-mail · 1. oldal / 1'],
    ['hu', 2, '2 e-mail · 1. oldal / 1'],
  ] as const)(
    'formats %s email pagination for a count of %s',
    async (language, count, expected) => {
      const instance = createInstance()
      await instance.init({
        lng: language,
        fallbackLng: false,
        resources: { en: { translation: en }, hu: { translation: hu } },
      })

      expect(
        instance.t('cms.emails.pagination', { count, page: 1, pages: 1 }),
      ).toBe(expected)
    },
  )

  it('keeps keys in the same order with matching placeholders and markup', () => {
    const english = flatten(en)
    const hungarian = flatten(hu)
    expect(Object.keys(hungarian)).toEqual(Object.keys(english))

    for (const key of new Set([
      ...Object.keys(english),
      ...Object.keys(hungarian),
    ])) {
      const englishText = english[key]
      const hungarianText = hungarian[key]
      const placeholders = (value: string) => {
        const matches = Array.from(
          value.matchAll(/{{\s*([^},]+)(?:,[^}]*)?}}/g),
          (match) => match[1]!.trim(),
        )

        return [...new Set(matches)].sort()
      }
      const markup = (value: string) =>
        Array.from(
          value.matchAll(/<\/?[a-z][^>]*>/gi),
          (match) => match[0],
        ).sort()

      expect(englishText?.trim()).toBeTruthy()
      expect(hungarianText?.trim()).toBeTruthy()
      expect({ [key]: placeholders(hungarianText!) }).toEqual({
        [key]: placeholders(englishText!),
      })
      expect({ [key]: markup(hungarianText!) }).toEqual({
        [key]: markup(englishText!),
      })
    }
  })

  it.each([
    ['en', en],
    ['hu', hu],
  ] as const)(
    'keeps decorative emojis out of the %s resources',
    (_language, resource) => {
      const messagesWithEmoji = Object.entries(flatten(resource)).filter(
        ([, text]) =>
          /\p{Extended_Pictographic}|\p{Emoji_Presentation}/u.test(text),
      )

      expect(messagesWithEmoji).toEqual([])
    },
  )
})
