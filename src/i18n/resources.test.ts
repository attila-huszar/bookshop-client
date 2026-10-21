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
  it('keeps both languages in the same order with complete matching placeholders', () => {
    const english = flatten(en)
    const hungarian = flatten(hu)
    expect(Object.keys(hungarian)).toEqual(Object.keys(english))

    for (const [key, text] of Object.entries(english)) {
      const placeholders = (value: string) => {
        const matches = Array.from(
          value.matchAll(/{{\s*([^},]+)(?:,[^}]*)?}}/g),
          (match) => match[1]!.trim(),
        )

        return [...new Set(matches)].sort()
      }
      expect(hungarian[key]?.trim()).not.toBe('')
      expect({ [key]: placeholders(hungarian[key]!) }).toEqual({
        [key]: placeholders(text),
      })
    }
  })
})
