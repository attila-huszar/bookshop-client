import { AuthorFormValues, BookFormValues } from '@/types'

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
