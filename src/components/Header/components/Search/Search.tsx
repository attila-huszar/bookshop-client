import { type SubmitEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { ROUTE } from '@/routes/route'
import { booksApi } from '@/store/api/booksApi'
import { useAppDispatch } from '@/hooks/redux'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import { CacheTime } from '@/constants/cacheTimes'
import type { Book } from '@/types'
import {
  imagePlaceholder,
  LinkIcon,
  SearchIcon,
  SpinnerIcon,
  XMarkIcon,
} from '@/assets/svg'
import {
  ClearButton,
  Dropdown,
  DropdownList,
  MenuItem,
  NoResults,
  SearchButton,
  SearchField,
  StyledForm,
  TextBold,
} from './Search.style'

export function Search() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const prefetchBook = booksApi.usePrefetch('book', {
    ifOlderThan: CacheTime.FiveMinutes,
  })

  const [searchValue, setSearchValue] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [response, setResponse] = useState<{
    query: string
    books: Book[]
    hasError: boolean
  } | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingRequest = useRef<{ abort: () => void } | null>(null)

  const query = searchValue.trim()
  const hasQuery = query.length > 1

  const currentResponse = response?.query === query ? response : null
  const searchResults = currentResponse?.books ?? []
  const isSearching = hasQuery && !currentResponse

  const debouncedSearch = useDebouncedCallback(getSearchResults)

  useClickOutside(searchRef, () => setSearchOpen(false))

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
    if (!hasQuery) return

    debouncedSearch(query)

    return () => {
      debouncedSearch.cancel()
      pendingRequest.current?.abort()
      pendingRequest.current = null
    }
  }, [debouncedSearch, hasQuery, query])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const nextQuery = value.trim()
    setSearchValue(value)

    if (nextQuery !== query) {
      setResponse(null)
      setSearchOpen(nextQuery.length > 1)
    }
  }

  const handleReset = () => {
    setSearchValue('')
    setResponse(null)
    setSearchOpen(false)
  }

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const firstBook = searchResults[0]

    if (firstBook) {
      void navigate(`/${ROUTE.BOOK}?id=${firstBook.id}`)
    }
  }

  return (
    <StyledForm ref={searchRef}>
      <form onSubmit={handleSubmit} onReset={handleReset}>
        <SearchField
          ref={inputRef}
          id="search-books"
          type="text"
          name="search"
          aria-label={t('catalogue.search')}
          aria-busy={isSearching}
          placeholder={t('catalogue.searchPlaceholder')}
          autoComplete="off"
          maxLength={100}
          onChange={handleSearchChange}
          onClick={() => setSearchOpen(hasQuery)}
          value={searchValue}
        />
        <Dropdown $show={searchOpen && !isSearching}>
          {!isSearching && (
            <DropdownList>
              {currentResponse?.hasError ? (
                <NoResults role="alert">{t('catalogue.searchError')}</NoResults>
              ) : searchResults.length ? (
                searchResults.map((book) => (
                  <li key={book.id}>
                    <Link
                      to={`/${ROUTE.BOOK}?id=${book.id}`}
                      onMouseEnter={() => prefetchBook(book.id)}
                      onFocus={() => prefetchBook(book.id)}
                      onClick={handleReset}>
                      <MenuItem>
                        <img
                          src={book.imgUrl}
                          onError={(e) =>
                            (e.currentTarget.src = imagePlaceholder)
                          }
                          alt={book.title}
                          width="24"
                          height="24"
                        />
                        <div>
                          <TextBold>{book.title}</TextBold>
                          <p>
                            <i>{t('common.by')} </i>
                            <span>{book.author}</span>
                          </p>
                        </div>
                        <LinkIcon width="16" height="16" />
                      </MenuItem>
                    </Link>
                  </li>
                ))
              ) : (
                <NoResults>{t('catalogue.noResults')}</NoResults>
              )}
            </DropdownList>
          )}
        </Dropdown>
        <SearchButton
          type="submit"
          title={t('catalogue.search')}
          aria-label={t('catalogue.search')}
          aria-busy={isSearching}>
          {isSearching ? (
            <SpinnerIcon width={16} height={16} aria-hidden="true" />
          ) : (
            <SearchIcon color="var(--color-on-surface-variant)" />
          )}
        </SearchButton>
        {searchValue && (
          <ClearButton
            type="reset"
            onClick={() => inputRef.current?.focus()}
            title={t('common.actions.clear')}>
            <XMarkIcon color="var(--color-on-surface-variant)" />
          </ClearButton>
        )}
      </form>
    </StyledForm>
  )
}
