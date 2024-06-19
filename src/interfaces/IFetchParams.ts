export interface IFetchParams {
  _page: number
  _limit: number
  genre: string[]
  discountPrice_gte: number
  discountPrice_lte: number
  discount_gte: number
  discount: number
  yearOfPublishing_gte: number
  yearOfPublishing_lte: number
  rating_gte: number
}
