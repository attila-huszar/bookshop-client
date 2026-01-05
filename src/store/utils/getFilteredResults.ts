import { store } from '../store'
import { FilterActive, FilterProps } from '@/types'

export const getFilteredResults = (
  filters?: FilterProps,
): FilterActive | null => {
  if (!filters) return null

  const { active, initial } = store.getState().books.booksFilters

  const isFilterActive: Record<keyof FilterActive, boolean> = {
    genre: active.genre.length > 0,
    priceMin: active.price[0] !== initial.price[0],
    priceMax: active.price[1] !== initial.price[1],
    discount: active.discount !== initial.discount,
    publishYearMin: active.publishYear[0] !== initial.publishYear[0],
    publishYearMax: active.publishYear[1] !== initial.publishYear[1],
    rating: active.rating !== initial.rating,
  }

  const hasAnyFilter = Object.values(isFilterActive).some(Boolean)

  if (!hasAnyFilter) return null

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
