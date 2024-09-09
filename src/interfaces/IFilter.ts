export interface IFilter {
  genre: string[]
  price: number[]
  discount: 'allBooks' | 'discountOnly' | 'fullPriceOnly'
  publishYear: number[]
  rating: Rating
}

type Rating = 0.5 | 1.5 | 2.5 | 3.5 | 4.5

export interface IFilterApplied extends Omit<IFilter, 'price' | 'publishYear'> {
  priceMin: number | null
  priceMax: number | null
  publishYearMin: number | null
  publishYearMax: number | null
}
