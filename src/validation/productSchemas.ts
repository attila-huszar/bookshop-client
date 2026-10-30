import * as Yup from 'yup'
import { i18n } from '@/i18n'
import './locale'

export const bookSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .min(2, () => i18n.t('validation.minLength', { min: '2' }))
    .max(100, () => i18n.t('validation.maxLength', { max: '100' }))
    .required(() => i18n.t('validation.required')),
  authorId: Yup.number()
    .integer()
    .positive()
    .required(() => i18n.t('validation.required')),
  publishYear: Yup.number()
    .integer()
    .positive(() => i18n.t('validation.positive'))
    .required(() => i18n.t('validation.required')),
  description: Yup.string()
    .trim()
    .min(10, () => i18n.t('validation.minLength', { min: '10' }))
    .max(500, () => i18n.t('validation.maxLength', { max: '500' }))
    .required(() => i18n.t('validation.required')),
  genre: Yup.string()
    .trim()
    .min(2, () => i18n.t('validation.minLength', { min: '2' }))
    .max(50, () => i18n.t('validation.maxLength', { max: '50' }))
    .required(() => i18n.t('validation.required')),
  imgUrl: Yup.string()
    .url(() => i18n.t('validation.url'))
    .required(() => i18n.t('validation.required')),
  price: Yup.number()
    .positive(() => i18n.t('validation.positive'))
    .required(() => i18n.t('validation.required')),
  discount: Yup.number()
    .integer(() => i18n.t('validation.integer'))
    .min(0, () => i18n.t('validation.minimum', { min: '0%' }))
    .max(100, () => i18n.t('validation.maximum', { max: '100%' }))
    .default(0),
  rating: Yup.number()
    .min(1, () => i18n.t('validation.minimum', { min: '1' }))
    .max(5, () => i18n.t('validation.maximum', { max: '5' }))
    .test(
      'max-1-decimal',
      () => i18n.t('validation.decimal'),
      (value) => value === undefined || Number.isInteger(value * 10),
    )
    .required(() => i18n.t('validation.required')),
})

export const authorSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, () => i18n.t('validation.minLength', { min: '2' }))
    .max(50, () => i18n.t('validation.maxLength', { max: '50' }))
    .required(() => i18n.t('validation.required')),
  fullName: Yup.string()
    .trim()
    .transform((value: string | undefined) =>
      value === '' ? undefined : value,
    )
    .min(2, () => i18n.t('validation.minLength', { min: '2' }))
    .max(100, () => i18n.t('validation.maxLength', { max: '100' })),
  birthYear: Yup.string().matches(/^[1-9]\d*$/, {
    message: () => i18n.t('validation.year'),
    excludeEmptyString: true,
  }),
  deathYear: Yup.string().matches(/^[1-9]\d*$/, {
    message: () => i18n.t('validation.year'),
    excludeEmptyString: true,
  }),
  homeland: Yup.string()
    .trim()
    .transform((value: string | undefined) =>
      value === '' ? undefined : value,
    )
    .min(2, () => i18n.t('validation.minLength', { min: '2' }))
    .max(50, () => i18n.t('validation.maxLength', { max: '50' })),
  biography: Yup.string()
    .trim()
    .transform((value: string | undefined) =>
      value === '' ? undefined : value,
    )
    .min(10, () => i18n.t('validation.minLength', { min: '10' }))
    .max(500, () => i18n.t('validation.maxLength', { max: '500' })),
})
