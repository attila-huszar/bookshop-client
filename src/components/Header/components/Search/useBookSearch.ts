import { useEffect, useRef, useState } from 'react'
import { booksApi } from '@/store/api/booksApi'
import { useAppDispatch } from '@/hooks/redux'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import type { Book } from '@/types'

export function useBookSearch() {
  const dispatch = useAppDispatch()
  const [searchValue, setSearchValue] = useState('')
  const [response, setResponse] = useState<{
    query: string
    books: Book[]
    hasError: boolean
  } | null>(null)
  const pendingRequest = useRef<{ abort: () => void } | null>(null)

  const query = searchValue.trim()
  const hasQuery = query.length > 1
  const currentResponse = response?.query === query ? response : null
  const isSearching = hasQuery && !currentResponse
  const debouncedSearch = useDebouncedCallback(getSearchResults)

  async function getSearchResults(searchQuery: string) {
    const request = dispatch(
      booksApi.endpoints.bookSearch.initiate(searchQuery, { subscribe: false }),
    )
    pendingRequest.current = request
    const result = await request

    if (pendingRequest.current !== request) {
      return
    }

    pendingRequest.current = null
    setResponse({
      query: searchQuery,
      books: result.error ? [] : (result.data ?? []),
      hasError: Boolean(result.error),
    })
  }

  useEffect(() => {
    if (!hasQuery) {
      return
    }

    debouncedSearch(query)

    return () => {
      debouncedSearch.cancel()
      pendingRequest.current?.abort()
      pendingRequest.current = null
    }
  }, [debouncedSearch, hasQuery, query])

  function updateSearchValue(value: string) {
    setSearchValue(value)
    const nextQuery = value.trim()

    if (nextQuery !== query) {
      setResponse(null)

      return nextQuery
    }
  }

  return {
    searchValue,
    hasQuery,
    currentResponse,
    isSearching,
    updateSearchValue,
  }
}
