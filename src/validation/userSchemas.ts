import * as Yup from 'yup'
import { imageSchema } from './fileSchemas'
import { UserRole } from '@/types'

export const emailSchema = Yup.string()
  .email('Invalid Email')
  .required('Required')

export const passwordSchema = Yup.string()
  .min(6, 'Min 6 characters')
  .matches(/^(?=.*[a-z])(?=.*\d)/, 'One number required')
  .required('Required')

export const passwordConfirmSchema = Yup.string().oneOf(
  [Yup.ref('password'), Yup.ref('newPassword')],
  'Passwords must match',
)

export const nameSchema = Yup.string()
  .max(100, 'Max 100 characters')
  .matches(
    /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/g,
    'Latin letters only',
  )
  .required('Required')

export const countrySchema = Yup.string()
  .length(2, 'Country code must be 2 characters')
  .matches(/^[a-z]{2}$/, 'Invalid country code')
  .required('Country is required')

export const addressSchema = Yup.object().shape({
  line1: Yup.string().required('Required'),
  line2: Yup.string(),
  city: Yup.string().required('Required'),
  state: Yup.string().required('Required'),
  postal_code: Yup.string().required('Required'),
  country: Yup.string().required('Required'),
})

export const phoneSchema = Yup.string().matches(
  /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/,
  'Invalid Phone number',
)

export const avatarSchema = Yup.string().url('Invalid URL')

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

export const searchSchema = Yup.string().required('Required')

export const accountBasicSchema = Yup.object().shape({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional(),
  country: countrySchema,
})

export const accountPasswordSchema = Yup.object().shape({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  newPasswordConfirmation: passwordConfirmSchema,
})

export const forgotPasswordSchema = emailSchema

export const resetPasswordSchema = Yup.object().shape({
  newPassword: passwordSchema,
  newPasswordConfirmation: passwordConfirmSchema,
})

export const userSchema = Yup.object().shape({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  role: Yup.mixed<UserRole>().oneOf(Object.values(UserRole), 'Invalid role'),
  phone: phoneSchema,
  avatar: avatarSchema,
  address: addressSchema,
})
