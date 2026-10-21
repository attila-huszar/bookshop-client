import * as Yup from 'yup'
import { i18n } from '@/i18n'
import { UserRole } from '@/types'
import { imageSchema } from './fileSchemas'
import './locale'

export const emailSchema = Yup.string()
  .trim()
  .email(() => i18n.t('validation.email'))
  .required(() => i18n.t('validation.required'))

export const passwordSchema = Yup.string()
  .min(6, () => i18n.t('validation.minLength', { min: '6' }))
  .matches(/^(?=.*[a-z])(?=.*\d)/, () => i18n.t('validation.numberRequired'))
  .required(() => i18n.t('validation.required'))

export const passwordConfirmSchema = Yup.string()
  .required(() => i18n.t('validation.required'))
  .oneOf([Yup.ref('password'), Yup.ref('newPassword')], () =>
    i18n.t('auth.passwordMismatch'),
  )

export const nameSchema = Yup.string()
  .trim()
  .max(100, () => i18n.t('validation.maxLength', { max: '100' }))
  .required(() => i18n.t('validation.required'))

export const countrySchema = Yup.string()
  .trim()
  .lowercase()
  .length(2, () => i18n.t('validation.countryLength'))
  .matches(/^[a-z]{2}$/, () => i18n.t('validation.country'))
  .required(() => i18n.t('validation.countryRequired'))

export const addressSchema = Yup.object().shape({
  line1: Yup.string().required(() => i18n.t('validation.required')),
  line2: Yup.string().nullable(),
  city: Yup.string().required(() => i18n.t('validation.required')),
  state: Yup.string().nullable().optional(),
  postal_code: Yup.string().required(() => i18n.t('validation.required')),
  country: countrySchema,
})

export const phoneSchema = Yup.string().matches(
  /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/,
  { message: () => i18n.t('validation.phone'), excludeEmptyString: true },
)

export const avatarSchema = Yup.string().url(() => i18n.t('validation.url'))

export const optionalAddressSchema = Yup.object({
  line1: Yup.string().max(200).nullable().optional(),
  line2: Yup.string().max(200).nullable().optional(),
  city: Yup.string().max(100).nullable().optional(),
  state: Yup.string().max(100).nullable().optional(),
  postal_code: Yup.string().max(30).nullable().optional(),
  country: Yup.string()
    .trim()
    .lowercase()
    .matches(/^[a-z]{2}$/, {
      message: () => i18n.t('validation.country'),
      excludeEmptyString: true,
    })
    .nullable()
    .optional(),
})
  .nullable()
  .default(undefined)
  .optional()

export const registrationSchema = Yup.object().shape({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  passwordConfirmation: passwordConfirmSchema,
  country: countrySchema,
  avatar: imageSchema.optional(),
})

export const loginSchema = Yup.object().shape({
  email: emailSchema,
  password: passwordSchema,
})

export const searchSchema = Yup.object({
  search: Yup.string()
    .trim()
    .required(() => i18n.t('validation.required')),
})

export const accountBasicSchema = Yup.object().shape({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.nullable().optional(),
})

export const accountPasswordSchema = Yup.object().shape({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  newPasswordConfirmation: passwordConfirmSchema,
})

export const forgotPasswordSchema = Yup.object({ email: emailSchema })

export const resetPasswordSchema = Yup.object().shape({
  newPassword: passwordSchema,
  newPasswordConfirmation: passwordConfirmSchema,
})

export const userSchema = Yup.object().shape({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  role: Yup.mixed<UserRole>().oneOf(Object.values(UserRole), () =>
    i18n.t('validation.role'),
  ),
  phone: phoneSchema.nullable(),
  avatar: avatarSchema.nullable(),
  address: optionalAddressSchema,
  country: countrySchema,
})

export const userCreateSchema = userSchema.shape({ password: passwordSchema })
