import * as Yup from 'yup'

const MAX_FILE_SIZE = 512000
const validFileExtensions = {
  image: ['jpg', 'gif', 'png', 'jpeg', 'svg', 'webp'],
}

function isValidFileType(
  file: File,
  fileType: keyof typeof validFileExtensions,
) {
  if (file instanceof File) {
    return validFileExtensions[fileType].includes(file.name.split('.')[1])
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

export const registrationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Min 2 characters')
    .max(50, 'Max 50 characters')
    .matches(
      /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/g,
      'Latin letters only',
    )
    .required('Required'),
  lastName: Yup.string()
    .min(2, 'Min 2 characters')
    .max(50, 'Max 50 characters')
    .matches(
      /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/g,
      'Latin letters only',
    )
    .required('Required'),
  email: Yup.string()
    .min(5, 'Invalid Email')
    .max(320, 'Max 320 characters')
    .email('Invalid Email')
    .required('Required'),

  password: Yup.string()
    .min(6, 'Min 6 characters')
    .max(30, 'Max 30 characters')
    .required('Required'),
  passwordConfirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Required'),
  phone: Yup.string()
    .matches(
      /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/,
      'Invalid Phone number',
    )
    .required('Required'),
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
  email: Yup.string().email('Invalid Email').required('Required'),
  password: Yup.string()
    .min(6, 'Min 6 characters')
    .max(30, 'Max 30 characters')
    .required('Required'),
})

export const searchSchema = Yup.object().shape({
  search: Yup.string().required(),
})
