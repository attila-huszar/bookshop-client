import type { Filters } from '@/types'

export const defaultCountry = 'hu'
export const defaultCurrency = 'USD'
export const defaultCurrencySymbol = '$'
export const defaultLocale = 'hu-HU'

export const languageOptions = [
  { language: 'en', country: 'gb' },
  { language: 'hu', country: 'hu' },
] as const

export const maxItemQuantity = 100

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

export const discountOptions = [
  { value: 'allBooks', label: 'filters.allBooks' },
  { value: 'discountOnly', label: 'filters.discountOnly' },
  { value: 'fullPriceOnly', label: 'filters.fullPrice' },
] as const satisfies readonly { value: Filters['discount']; label: string }[]

export const filterInitialValues: Filters = {
  genre: [],
  price: [],
  discount: 'allBooks',
  publishYear: [],
  rating: 0.5,
}
