import { FilterActive, Filters } from '@/types'

export const getFilteredBooks = (
  booksFilters: { active: Filters; initial: Filters },
  filters?: Filters,
): FilterActive | null => {
  const { initial } = booksFilters

  if (!filters) {
    return null
  }

  const isFilterActive: Record<keyof FilterActive, boolean> = {
    genre: filters.genre.length > 0,
    priceMin: filters.price[0] !== initial.price[0],
    priceMax: filters.price[1] !== initial.price[1],
    discount: filters.discount !== initial.discount,
    publishYearMin: filters.publishYear[0] !== initial.publishYear[0],
    publishYearMax: filters.publishYear[1] !== initial.publishYear[1],
    rating: filters.rating !== initial.rating,
  }

  const hasAnyFilter = Object.values(isFilterActive).some(Boolean)

  if (!hasAnyFilter) {
    return null
  }

  return {
    genre: isFilterActive.genre ? filters.genre : [],
    priceMin: isFilterActive.priceMin ? (filters.price[0] ?? null) : null,
    priceMax: isFilterActive.priceMax ? (filters.price[1] ?? null) : null,
    discount: isFilterActive.discount ? filters.discount : 'allBooks',
    publishYearMin: isFilterActive.publishYearMin
      ? (filters.publishYear[0] ?? null)
      : null,
    publishYearMax: isFilterActive.publishYearMax
      ? (filters.publishYear[1] ?? null)
      : null,
    rating: isFilterActive.rating ? filters.rating : 0.5,
  }
}
