import * as Yup from 'yup'

export const bookSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, 'Min 2 characters')
    .max(100, 'Max 100 characters')
    .required('Required'),
  author: Yup.string()
    .required('Required')
    .test(
      'not-placeholder',
      'Select author',
      (value) => !value.includes('Please select an author'),
    ),
  publishYear: Yup.number()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .required('Required'),
  description: Yup.string()
    .min(10, 'Min 10 characters')
    .max(500, 'Max 500 characters')
    .required('Required'),
  genre: Yup.string()
    .min(2, 'Min 2 characters')
    .max(50, 'Max 50 characters')
    .required('Required'),
  imgUrl: Yup.string().url('Invalid URL').required('Required'),
  price: Yup.number().positive('Must be positive').required('Required'),
  rating: Yup.number().min(1, 'Min 1').max(5, 'Max 5').required('Required'),
})
