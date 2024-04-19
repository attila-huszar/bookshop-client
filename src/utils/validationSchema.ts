import * as Yup from 'yup'

export const RegistrationSchema = Yup.object().shape({
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
  phone: Yup.string()
    .matches(
      /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/,
      'Invalid Phone number',
    )
    .required('Required'),
  password: Yup.string()
    .min(6, 'Min 6 characters')
    .max(30, 'Max 30 characters')
    .required('Required'),
  passwordConfirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Required'),
})

export const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid Email').required('Required'),
  password: Yup.string()
    .min(6, 'Min 6 characters')
    .max(30, 'Max 30 characters')
    .required('Required'),
})
