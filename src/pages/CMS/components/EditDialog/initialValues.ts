import {
  AuthorFormValues,
  BookFormValues,
  OrderFormValues,
  UserFormValues,
  UserRole,
} from '@/types'

export const initialBookValues: BookFormValues = {
  title: '',
  authorId: 0,
  genre: '',
  imgUrl: '',
  description: '',
  publishYear: 2000,
  rating: 5,
  price: 0,
  discount: 0,
  discountPrice: 0,
  topSellers: false,
  newRelease: false,
}

export const initialAuthorValues: AuthorFormValues = {
  name: '',
  fullName: '',
  birthYear: '',
  deathYear: '',
  homeland: '',
  biography: '',
}

export const initialOrderValues: OrderFormValues = {
  paymentId: '',
  paymentStatus: 'processing',
  total: 0,
  currency: 'EUR',
  items: [],
  firstName: '',
  lastName: '',
  email: '',
  shipping: {
    name: '',
    phone: '',
    address: {
      city: '',
      line1: '',
      line2: '',
      postal_code: '',
      state: '',
      country: '',
    },
  },
}

export const initialUserValues: UserFormValues = {
  email: '',
  firstName: '',
  lastName: '',
  country: '',
  role: UserRole.User,
  avatar: '',
  phone: '',
  address: {
    city: '',
    country: '',
    line1: '',
    line2: '',
    postal_code: '',
    state: '',
  },
}
