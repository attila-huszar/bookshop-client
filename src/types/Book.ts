export type Book = {
  id: number
  title: string
  authorId?: number
  author?: string
  genre: string
  imgUrl: string
  description: string
  publishYear: number
  rating: number
  price: number
  discount: number
  discountPrice: number
  topSellers?: boolean
  newRelease?: boolean
}
