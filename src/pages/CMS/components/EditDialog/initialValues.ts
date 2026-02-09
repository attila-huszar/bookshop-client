import { defaultCurrency } from '@/constants'
import {
  Author,
  BookWithAuthorId,
  Order,
  UserRole,
  UserWithMetadata,
} from '@/types'

export const initialBookValues: BookWithAuthorId = {
  id: 0,
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

export const initialAuthorValues: Author = {
  id: 0,
  name: '',
  fullName: '',
  birthYear: '',
  deathYear: '',
  homeland: '',
  biography: '',
}

export const initialOrderValues: Order = {
  id: 0,
  paymentId: '',
  paymentStatus: 'processing',
  total: 0,
  currency: defaultCurrency,
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
  paidAt: null,
  createdAt: '',
  updatedAt: '',
}

export const initialUserValues: UserWithMetadata = {
  id: 0,
  uuid: '',
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
  verified: false,
  verificationToken: null,
  verificationExpires: null,
  passwordResetToken: null,
  passwordResetExpires: null,
  createdAt: '',
  updatedAt: '',
}
