import * as Yup from 'yup'

const MAX_FILE_SIZE = 512000
const validFileExtensions = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp']

export function validateImageFile(file: unknown): {
  valid: boolean
  error?: string
} {
  if (!(file instanceof File)) {
    return { valid: false, error: 'Invalid file selected' }
  }
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file' }
  }
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !validFileExtensions.includes(ext)) {
    return { valid: false, error: 'Unsupported image format' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Image must be smaller than ${MAX_FILE_SIZE / 1000}KB`,
    }
  }
  return { valid: true }
}

export const imageSchema = Yup.mixed()
  .test('is-valid-image', 'Invalid image file', (file) => {
    if (!file) return true
    return validateImageFile(file).valid
  })
  .nullable()
