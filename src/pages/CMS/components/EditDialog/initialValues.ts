import {
  AuthorFormValues,
  BookFormValues,
  OrderFormValues,
  OrderStatus,
  UserFormValues,
  UserRole,
} from '@/types'

export const initialBookValues: BookFormValues = {
  title: '',
  authorId: '',
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
  paymentIntentStatus: 'processing',
  orderStatus: OrderStatus.Pending,
  total: 0,
  currency: 'USD',
  items: [],
  name: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: {
    city: '',
    line1: '',
    line2: '',
    postal_code: '',
    state: '',
    country: '',
  },
}

export const initialUserValues: UserFormValues = {
  email: '',
  firstName: '',
  lastName: '',
  role: UserRole.User,
  avatar: '',
  phone: '',
  address: {},
}
