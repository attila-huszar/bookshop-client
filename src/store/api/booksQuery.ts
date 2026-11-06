import type { BookCriteria, Filters } from '@/types'

export type BooksQueryArgs = {
  currentPage: number
  itemsPerPage: number
  criteria?: BookCriteria
}

/** Omit bounds covering the initial range and reuse the unfiltered query when nothing narrows it. */
export function buildBookCriteria(
  initial: Filters,
  filters?: Filters,
): BookCriteria | undefined {
  if (!filters) {
    return undefined
  }

  const criteria: BookCriteria = {}
  const ranges = [
    ['discountPrice', filters.price, initial.price],
    ['publishYear', filters.publishYear, initial.publishYear],
  ] as const

  for (const [field, range, initialRange] of ranges) {
    const [min, max] = range
    const [initialMin = -Infinity, initialMax = Infinity] = initialRange

    if (min !== undefined && min > initialMin) {
      criteria[`${field}_gte`] = min
    }

    if (max !== undefined && max < initialMax) {
      criteria[`${field}_lte`] = max
    }
  }

  if (filters.genre.length) {
    criteria.genre = filters.genre
  }

  if (filters.discount === 'discountOnly') {
    criteria.discount_gte = 1
  } else if (filters.discount === 'fullPriceOnly') {
    criteria.discount = 0
  }

  if (filters.rating > 1) {
    criteria.rating_gte = filters.rating
  }

  return Object.keys(criteria).length ? criteria : undefined
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

  for (const [key, value] of Object.entries(criteria ?? {})) {
    if (value !== undefined) {
      for (const item of Array.isArray(value) ? value : [value]) {
        params.append(key, String(item))
      }
    }
  }

  return params
}
