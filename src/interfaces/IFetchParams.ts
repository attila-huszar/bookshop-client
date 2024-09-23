export interface IFetchParams {
  currentPage: number
  itemsPerPage: number
  genre: string[]
  discountPrice_gte: number
  discountPrice_lte: number
  discount_gte: number
  discount: number
  publishYear_gte: number
  publishYear_lte: number
  rating_gte: number
}
