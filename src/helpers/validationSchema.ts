import * as Yup from 'yup'

const MAX_FILE_SIZE = 512000
const validFileExtensions = {
  image: ['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp'],
}

function isValidFileType(
  file: File,
  fileType: keyof typeof validFileExtensions,
) {
  if (file instanceof File) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    return fileExtension
      ? validFileExtensions[fileType].includes(fileExtension)
      : false
  } else {
    return true
  }
}

function isValidFileSize(file: File, fileSize: number) {
  if (file instanceof File) {
    return file.size <= fileSize
  } else {
    return true
  }
}

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
  .min(2, 'Min 2 characters')
  .max(50, 'Max 50 characters')
  .matches(
    /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/g,
    'Latin letters only',
  )
  .required('Required')

export const registrationSchema = Yup.object().shape({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  passwordConfirmation: passwordConfirmSchema,
  avatar: Yup.mixed()
    .test('is-valid-type', 'Invalid image type', (file) =>
      isValidFileType(file as File, 'image'),
    )
    .test('is-valid-size', 'Max size is 500KB', (file) =>
      isValidFileSize(file as File, MAX_FILE_SIZE),
    )
    .nullable(),
})

export const loginSchema = Yup.object().shape({
  email: emailSchema,
  password: passwordSchema,
})

export const searchSchema = Yup.string().required('Required')

export const accountBasicSchema = Yup.object().shape({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: Yup.string().matches(
    /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/,
    'Invalid Phone number',
  ),
})

export const accountAddressSchema = Yup.object().shape({
  line1: Yup.string().required('Required'),
  line2: Yup.string(),
  city: Yup.string().required('Required'),
  state: Yup.string().required('Required'),
  postal_code: Yup.string().required('Required'),
  country: Yup.string().required('Required'),
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
