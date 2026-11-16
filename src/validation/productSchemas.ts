import * as Yup from 'yup'
import { i18n } from '@/i18n'
import { validationLimits } from '@/constants/validation'
import './locale'

export const bookSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .min(validationLimits.book.titleMinLength, () =>
      i18n.t('validation.minLength', {
        min: String(validationLimits.book.titleMinLength),
      }),
    )
    .max(validationLimits.book.titleMaxLength, () =>
      i18n.t('validation.maxLength', {
        max: String(validationLimits.book.titleMaxLength),
      }),
    )
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
    .min(validationLimits.book.descriptionMinLength, () =>
      i18n.t('validation.minLength', {
        min: String(validationLimits.book.descriptionMinLength),
      }),
    )
    .max(validationLimits.book.descriptionMaxLength, () =>
      i18n.t('validation.maxLength', {
        max: String(validationLimits.book.descriptionMaxLength),
      }),
    )
    .required(() => i18n.t('validation.required')),
  genre: Yup.string()
    .trim()
    .min(validationLimits.book.genreMinLength, () =>
      i18n.t('validation.minLength', {
        min: String(validationLimits.book.genreMinLength),
      }),
    )
    .max(validationLimits.book.genreMaxLength, () =>
      i18n.t('validation.maxLength', {
        max: String(validationLimits.book.genreMaxLength),
      }),
    )
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
    .max(validationLimits.discountMaxPercent, () =>
      i18n.t('validation.maximum', {
        max: `${validationLimits.discountMaxPercent}%`,
      }),
    )
    .default(0),
  rating: Yup.number()
    .min(validationLimits.book.ratingMin, () =>
      i18n.t('validation.minimum', {
        min: String(validationLimits.book.ratingMin),
      }),
    )
    .max(validationLimits.book.ratingMax, () =>
      i18n.t('validation.maximum', {
        max: String(validationLimits.book.ratingMax),
      }),
    )
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
    .min(validationLimits.author.nameMinLength, () =>
      i18n.t('validation.minLength', {
        min: String(validationLimits.author.nameMinLength),
      }),
    )
    .max(validationLimits.author.nameMaxLength, () =>
      i18n.t('validation.maxLength', {
        max: String(validationLimits.author.nameMaxLength),
      }),
    )
    .required(() => i18n.t('validation.required')),
  fullName: Yup.string()
    .trim()
    .transform((value: string | undefined) =>
      value === '' ? undefined : value,
    )
    .min(validationLimits.author.fullNameMinLength, () =>
      i18n.t('validation.minLength', {
        min: String(validationLimits.author.fullNameMinLength),
      }),
    )
    .max(validationLimits.author.fullNameMaxLength, () =>
      i18n.t('validation.maxLength', {
        max: String(validationLimits.author.fullNameMaxLength),
      }),
    ),
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
    .min(validationLimits.author.homelandMinLength, () =>
      i18n.t('validation.minLength', {
        min: String(validationLimits.author.homelandMinLength),
      }),
    )
    .max(validationLimits.author.homelandMaxLength, () =>
      i18n.t('validation.maxLength', {
        max: String(validationLimits.author.homelandMaxLength),
      }),
    ),
  biography: Yup.string()
    .trim()
    .transform((value: string | undefined) =>
      value === '' ? undefined : value,
    )
    .min(validationLimits.author.biographyMinLength, () =>
      i18n.t('validation.minLength', {
        min: String(validationLimits.author.biographyMinLength),
      }),
    )
    .max(validationLimits.author.biographyMaxLength, () =>
      i18n.t('validation.maxLength', {
        max: String(validationLimits.author.biographyMaxLength),
      }),
    ),
})
