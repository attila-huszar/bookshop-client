export interface IBook {
  id: number
  title: string
  author: number
  genre: string
  imgUrl: string
  favorite: boolean
  description: string
  yearOfPublishing: string
  price: string
  rating: number
  discount: number
  new: boolean
  topSellers?: boolean
}
