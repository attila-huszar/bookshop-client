import * as Yup from 'yup'
import { i18n } from '@/i18n'
import './locale'

export const MAX_IMAGE_SIZE_BYTES = 1024 * 1024
export const IMAGE_ACCEPT = 'image/*'

export function validateImageFile(file: unknown): {
  valid: boolean
  error?: string
} {
  if (!(file instanceof File)) {
    return { valid: false, error: i18n.t('validation.image') }
  }
  if (!file.size) {
    return { valid: false, error: i18n.t('validation.imageRequired') }
  }
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: i18n.t('validation.imageFormat') }
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: i18n.t('validation.imageSize', {
        size: MAX_IMAGE_SIZE_BYTES / (1024 * 1024),
      }),
    }
  }
  return { valid: true }
}

export const imageSchema = Yup.mixed()
  .test(
    'is-valid-image',
    () => i18n.t('validation.image'),
    (file) => {
      if (!file) {
        return true
      }

      return validateImageFile(file).valid
    },
  )
  .nullable()
