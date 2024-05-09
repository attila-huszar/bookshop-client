export interface IFilter {
  genre: string[]
  price: number[]
  discount: 'allBooks' | 'discountOnly' | 'fullPriceOnly'
  publishYear: number[]
  rating: 0.5 | 1.5 | 2.5 | 3.5 | 4.5
}
