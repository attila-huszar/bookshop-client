import { IFilter } from '../interfaces'

export const loginInitialValues = {
  email: '',
  password: '',
}

export const registrationInitialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  avatar: null,
}

export const passwordChangeInitialValues = {
  currentPassword: '',
  newPassword: '',
  newPasswordConfirmation: '',
}

export const discountOptions: {
  value: IFilter['discount']
  label: string
}[] = [
  { value: 'allBooks', label: 'All Books' },
  { value: 'discountOnly', label: 'With Discount' },
  { value: 'fullPriceOnly', label: 'Full Price Books' },
]

export const filterInitialValues: IFilter = {
  genre: [],
  price: [],
  discount: discountOptions[0].value,
  publishYear: [],
  rating: 0.5,
}
