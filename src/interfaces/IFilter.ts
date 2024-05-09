export interface IFilter {
  genre: string[]
  price: number[]
  discount: 'allBooks' | 'discountOnly' | 'fullPriceOnly'
  publishYear: number[]
  rating: 1 | 2 | 3 | 4 | 5
}
