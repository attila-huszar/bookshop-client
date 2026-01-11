import type { Filters } from '@/types'

export const defaultCountry = 'hu'
export const defaultCurrency = 'USD'
export const defaultCurrencySymbol = '$'

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
  country: '',
  avatar: null,
}

export const passwordChangeInitialValues = {
  currentPassword: '',
  newPassword: '',
  newPasswordConfirmation: '',
}

export const passwordResetInitialValues = {
  newPassword: '',
  newPasswordConfirmation: '',
}

export const discountOptions: {
  value: Filters['discount']
  label: string
}[] = [
  { value: 'allBooks', label: 'All Books' },
  { value: 'discountOnly', label: 'With Discount' },
  { value: 'fullPriceOnly', label: 'Full Price Books' },
]

export const filterInitialValues: Filters = {
  genre: [],
  price: [],
  discount: 'allBooks',
  publishYear: [],
  rating: 0.5,
}
