import { describe, expect, it } from 'vitest'
import { MAX_IMAGE_SIZE_BYTES, validateImageFile } from './fileSchemas'

describe('image upload validation', () => {
  it('accepts exactly 1 MiB and rejects larger or empty files', () => {
    expect(
      validateImageFile(
        new File([new Uint8Array(MAX_IMAGE_SIZE_BYTES)], 'cover.png', {
          type: 'image/png',
        }),
      ).valid,
    ).toBe(true)
    expect(
      validateImageFile(
        new File([new Uint8Array(MAX_IMAGE_SIZE_BYTES + 1)], 'cover.png', {
          type: 'image/png',
        }),
      ).valid,
    ).toBe(false)
    expect(
      validateImageFile(new File([], 'cover.png', { type: 'image/png' })).valid,
    ).toBe(false)
  })

  it('accepts any image MIME type without restricting filenames', () => {
    expect(
      validateImageFile(
        new File(['image'], 'cover.avif', { type: 'image/avif' }),
      ).valid,
    ).toBe(true)
    expect(
      validateImageFile(
        new File(['image'], 'cover.png', { type: 'image/jpeg' }),
      ).valid,
    ).toBe(true)
    expect(
      validateImageFile(
        new File(['image'], 'cover.JPG', { type: 'image/jpeg' }),
      ).valid,
    ).toBe(true)
    expect(
      validateImageFile(new File(['image'], 'upload', { type: 'image/tiff' }))
        .valid,
    ).toBe(true)
  })

  it('rejects non-image MIME types', () => {
    expect(
      validateImageFile(new File(['text'], 'cover.png', { type: 'text/plain' }))
        .valid,
    ).toBe(false)
  })
})
