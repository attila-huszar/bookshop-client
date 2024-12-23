import type { FilterProps } from '@/types'

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
  avatar: undefined,
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
  value: FilterProps['discount']
  label: string
}[] = [
  { value: 'allBooks', label: 'All Books' },
  { value: 'discountOnly', label: 'With Discount' },
  { value: 'fullPriceOnly', label: 'Full Price Books' },
]

export const filterInitialValues: FilterProps = {
  genre: [],
  price: [],
  discount: discountOptions[0].value,
  publishYear: [],
  rating: 0.5,
}
