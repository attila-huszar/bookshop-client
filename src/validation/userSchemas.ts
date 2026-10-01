import * as Yup from 'yup'
import { UserRole } from '@/types'
import { imageSchema } from './fileSchemas'

export const emailSchema = Yup.string()
  .trim()
  .email('Invalid Email')
  .required('Required')

export const passwordSchema = Yup.string()
  .min(6, 'Min 6 characters')
  .matches(/^(?=.*[a-z])(?=.*\d)/, 'One number required')
  .required('Required')

export const passwordConfirmSchema = Yup.string()
  .required('Required')
  .oneOf([Yup.ref('password'), Yup.ref('newPassword')], 'Passwords must match')

export const nameSchema = Yup.string()
  .trim()
  .max(100, 'Max 100 characters')
  .required('Required')

export const countrySchema = Yup.string()
  .trim()
  .lowercase()
  .length(2, 'Country code must be 2 characters')
  .matches(/^[a-z]{2}$/, 'Invalid country code')
  .required('Country is required')

export const addressSchema = Yup.object().shape({
  line1: Yup.string().required('Required'),
  line2: Yup.string().nullable(),
  city: Yup.string().required('Required'),
  state: Yup.string().nullable().optional(),
  postal_code: Yup.string().required('Required'),
  country: countrySchema,
})

export const phoneSchema = Yup.string().matches(
  /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/,
  { message: 'Invalid Phone number', excludeEmptyString: true },
)

export const avatarSchema = Yup.string().url('Invalid URL')

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
      message: 'Invalid country code',
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
  search: Yup.string().trim().required('Required'),
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
  role: Yup.mixed<UserRole>().oneOf(Object.values(UserRole), 'Invalid role'),
  phone: phoneSchema.nullable(),
  avatar: avatarSchema.nullable(),
  address: optionalAddressSchema,
  country: countrySchema,
})

export const userCreateSchema = userSchema.shape({ password: passwordSchema })
