export type Book = {
  id: number
  title: string
  author: string | null
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
  createdAt?: string
  updatedAt?: string
}

export type BookWithAuthorId = Omit<Book, 'author'> & { authorId: number }

export type BookCreate = Omit<
  BookWithAuthorId,
  'id' | 'createdAt' | 'updatedAt'
>

export type BookUpdate = { id: number } & Partial<BookCreate>
