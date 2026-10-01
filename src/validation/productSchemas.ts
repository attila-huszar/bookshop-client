import * as Yup from 'yup'

export const bookSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .min(2, 'Min 2 characters')
    .max(100, 'Max 100 characters')
    .required('Required'),
  authorId: Yup.number().integer().positive().required('Required'),
  publishYear: Yup.number().integer().positive('+').required('Required'),
  description: Yup.string()
    .trim()
    .min(10, 'Min 10 characters')
    .max(500, 'Max 500 characters')
    .required('Required'),
  genre: Yup.string()
    .trim()
    .min(2, 'Min 2 characters')
    .max(50, 'Max 50 characters')
    .required('Required'),
  imgUrl: Yup.string().url('Invalid URL').required('Required'),
  price: Yup.number().positive('+').required('Required'),
  discount: Yup.number()
    .integer('No fraction')
    .min(0, 'Min 0%')
    .max(100, 'Max 100%')
    .default(0),
  rating: Yup.number()
    .min(1, 'Min 1')
    .max(5, 'Max 5')
    .test(
      'max-1-decimal',
      'Max 1 decimal',
      (value) => value === undefined || Number.isInteger(value * 10),
    )
    .required('Required'),
})

export const authorSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, 'Min 2 characters')
    .max(50, 'Max 50 characters')
    .required('Required'),
  fullName: Yup.string()
    .trim()
    .transform((value: string | undefined) =>
      value === '' ? undefined : value,
    )
    .min(2, 'Min 2 characters')
    .max(100, 'Max 100 characters'),
  birthYear: Yup.string().matches(/^[1-9]\d*$/, {
    message: 'Positive whole year required',
    excludeEmptyString: true,
  }),
  deathYear: Yup.string().matches(/^[1-9]\d*$/, {
    message: 'Positive whole year required',
    excludeEmptyString: true,
  }),
  homeland: Yup.string()
    .trim()
    .transform((value: string | undefined) =>
      value === '' ? undefined : value,
    )
    .min(2, 'Min 2 characters')
    .max(50, 'Max 50 characters'),
  biography: Yup.string()
    .trim()
    .transform((value: string | undefined) =>
      value === '' ? undefined : value,
    )
    .min(10, 'Min 10 characters')
    .max(500, 'Max 500 characters'),
})
