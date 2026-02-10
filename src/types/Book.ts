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
  createdAt?: string
  updatedAt?: string
}

export type BookWithAuthorId = Omit<Book, 'author'> & { authorId: number }

export type BookUpdate = { id: number } & Partial<
  Omit<Book, 'id' | 'createdAt' | 'updatedAt'>
>
