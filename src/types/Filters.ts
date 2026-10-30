export type Filters = {
  genre: string[]
  price: number[]
  discount: 'allBooks' | 'discountOnly' | 'fullPriceOnly'
  publishYear: number[]
  rating: Rating
}

type Rating = 0.5 | 1.5 | 2.5 | 3.5 | 4.5

/** Applied catalogue criteria use API parameter names and omit inactive filters. */
export type BookCriteria = {
  genre?: string[]
  discountPrice_gte?: number
  discountPrice_lte?: number
  discount?: number
  discount_gte?: number
  publishYear_gte?: number
  publishYear_lte?: number
  rating_gte?: number
}
