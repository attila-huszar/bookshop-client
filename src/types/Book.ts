export type Book = {
  id: number
  title: string
  author: string
  genre: string
  imgUrl: string
  description: string
  publishYear: number
  rating: number
  price: number
  discount: number
  discountPrice: number
  topSellers: boolean
  newRelease: boolean
}

export type BookWithAuthorId = Omit<Book, 'author'> & { authorId: number }

export type BookFormValues = Omit<BookWithAuthorId, 'id'>
