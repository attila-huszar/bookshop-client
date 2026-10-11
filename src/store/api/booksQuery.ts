import type { FilterActive } from '@/types'

export type BooksQueryArgs = {
  currentPage: number
  itemsPerPage: number
  criteria?: FilterActive
}

export function booksSearchParams({
  currentPage,
  itemsPerPage,
  criteria,
}: BooksQueryArgs): URLSearchParams {
  const params = new URLSearchParams({
    page: String(currentPage),
    limit: String(itemsPerPage),
  })

  criteria?.genre?.forEach((genre) => params.append('genre', genre))

  if (criteria?.priceMin != null) {
    params.set('discountPrice_gte', String(criteria.priceMin))
  }

  if (criteria?.priceMax != null) {
    params.set('discountPrice_lte', String(criteria.priceMax))
  }

  if (criteria?.discount === 'discountOnly') {
    params.set('discount_gte', '1')
  } else if (criteria?.discount === 'fullPriceOnly') {
    params.set('discount', '0')
  }

  if (criteria?.publishYearMin) {
    params.set('publishYear_gte', String(criteria.publishYearMin))
  }

  if (criteria?.publishYearMax) {
    params.set('publishYear_lte', String(criteria.publishYearMax))
  }

  if (criteria?.rating && criteria.rating > 1) {
    params.set('rating_gte', String(criteria.rating))
  }

  return params
}
