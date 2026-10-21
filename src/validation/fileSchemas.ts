import * as Yup from 'yup'
import { i18n } from '@/i18n'
import './locale'

const MAX_FILE_SIZE = 512000
const validFileExtensions = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp']

export function validateImageFile(file: unknown): {
  valid: boolean
  error?: string
} {
  if (!(file instanceof File)) {
    return { valid: false, error: i18n.t('validation.image') }
  }
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: i18n.t('validation.imageRequired') }
  }
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !validFileExtensions.includes(ext)) {
    return { valid: false, error: i18n.t('validation.imageFormat') }
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: i18n.t('validation.imageSize', { size: MAX_FILE_SIZE / 1000 }),
    }
  }
  return { valid: true }
}

export const imageSchema = Yup.mixed()
  .test(
    'is-valid-image',
    () => i18n.t('validation.image'),
    (file) => {
      if (!file) return true
      return validateImageFile(file).valid
    },
  )
  .nullable()
