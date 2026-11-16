import { i18n } from '@/i18n'
import { setLocale } from 'yup'

setLocale({
  mixed: {
    default: () => i18n.t('validation.type'),
    required: () => i18n.t('validation.required'),
    notType: () => i18n.t('validation.type'),
    oneOf: () => i18n.t('validation.type'),
    notOneOf: () => i18n.t('validation.type'),
    notNull: () => i18n.t('validation.required'),
    defined: () => i18n.t('validation.required'),
  },
  string: {
    min: ({ min }) => i18n.t('validation.minLength', { min }),
    max: ({ max }) => i18n.t('validation.maxLength', { max }),
    length: () => i18n.t('validation.type'),
    matches: () => i18n.t('validation.type'),
    email: () => i18n.t('validation.email'),
    url: () => i18n.t('validation.url'),
  },
  number: {
    min: ({ min }) => i18n.t('validation.minimum', { min }),
    max: ({ max }) => i18n.t('validation.maximum', { max }),
    integer: () => i18n.t('validation.integer'),
    moreThan: () => i18n.t('validation.positive'),
  },
  array: {
    min: () => i18n.t('validation.orderItems'),
  },
})
