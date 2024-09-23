export interface IBook {
  id: number
  title: string
  author: number
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
