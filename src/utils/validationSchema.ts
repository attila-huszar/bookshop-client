import * as Yup from 'yup'

const phoneRegExp =
  /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/

export const RegistrationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  lastName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  email: Yup.string()
    .min(5, 'Too Short!')
    .max(320, 'Too Long!')
    .email('Invalid email')
    .required('Required'),
  phone: Yup.string().matches(phoneRegExp, 'Phone number is not valid'),
  password: Yup.string()
    .min(6, 'Too Short!')
    .max(30, 'Too Long!')
    .required('Required'),
  passwordConfirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Required'),
})
