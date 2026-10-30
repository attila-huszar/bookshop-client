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
  it('keeps base keys in the same order with matching placeholders across contexts', () => {
    const english = flatten(en)
    const hungarian = flatten(hu)
    const baseKeys = (resource: Record<string, string>) =>
      Object.keys(resource).filter((key) => !key.endsWith('_accusative'))
    expect(baseKeys(hungarian)).toEqual(baseKeys(english))

    for (const key of new Set([
      ...Object.keys(english),
      ...Object.keys(hungarian),
    ])) {
      const baseKey = key.replace(/_accusative$/, '')
      const englishText = english[key] ?? english[baseKey]
      const hungarianText = hungarian[key] ?? hungarian[baseKey]
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
