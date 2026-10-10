import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Form, Formik } from 'formik'
import { ROUTE } from '@/routes'
import { bookshopApi } from '@/store/api/bookshopApi'
import { useAppDispatch, useClickOutside, useDebounce } from '@/hooks'
import { searchSchema } from '@/validation'
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const searchRequestId = useRef(0)
  const pendingRequests = useRef<{ abort: () => void }[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const debouncedSearchResults = useDebounce(getSearchResults)

  useClickOutside(searchRef, () => setSearchOpen(false))

  const cancelSearch = useCallback(() => {
    searchRequestId.current += 1

    for (const request of pendingRequests.current) {
      request.abort()
    }

    pendingRequests.current = []
  }, [])

  useEffect(() => cancelSearch, [cancelSearch])

  async function getSearchResults(searchString: string, requestId: number) {
    if (requestId !== searchRequestId.current) {
      return
    }

    if (searchString.length > 1) {
      const searchRequests = [
        dispatch(
          bookshopApi.endpoints.bookSearch.initiate(searchString, {
            subscribe: false,
          }),
        ),
        dispatch(
          bookshopApi.endpoints.authorSearch.initiate(searchString, {
            subscribe: false,
          }),
        ),
      ] as const
      pendingRequests.current = [...searchRequests]

      const [booksSearchResponse, authorsSearchResponse] =
        await Promise.all(searchRequests)

      if (requestId !== searchRequestId.current) {
        return
      }

      if (booksSearchResponse.error || authorsSearchResponse.error) {
        pendingRequests.current = []
        setSearchError('Could not load search results. Please try again.')
        setIsSearching(false)

        return
      }

      const booksSearched: Book[] = [...(booksSearchResponse.data ?? [])]
      const authorsSearched = authorsSearchResponse.data ?? []

      if (authorsSearched.length) {
        const authorRequests = authorsSearched.map((author) =>
          dispatch(
            bookshopApi.endpoints.booksByAuthor.initiate(author.id, {
              subscribe: false,
            }),
          ),
        )
        pendingRequests.current = authorRequests

        const authorsMatched = await Promise.allSettled(authorRequests)

        authorsMatched.forEach((book) => {
          if (book.status === 'fulfilled' && book.value.data) {
            const newBooks = book.value.data

            newBooks.forEach((newBook) => {
              const exists = booksSearched.some(
                (existingBook) => existingBook.id === newBook.id,
              )

              if (!exists) {
                booksSearched.push(newBook)
              }
            })
          }
        })
      }

      if (requestId !== searchRequestId.current) {
        return
      }

      pendingRequests.current = []
      setSearchResults(booksSearched)
      setIsSearching(false)
      setSearchOpen(true)
    } else {
      setSearchResults([])
      setSearchOpen(false)
    }
  }

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  ) => {
    handleChange(e)
    const value = e.target.value
    cancelSearch()
    setSearchResults([])
    setSearchError(null)
    setIsSearching(value.length > 1)
    setSearchOpen(value.length > 1)
    debouncedSearchResults(value, searchRequestId.current)
  }

  const handleClick = () => {
    if (searchResults.length || isSearching || searchError) {
      setSearchOpen(true)
    }
  }

  const handleReset = () => {
    cancelSearch()
    setSearchOpen(false)
    setSearchResults([])
    setIsSearching(false)
    setSearchError(null)
  }

  const handleSubmit = () => {
    if (searchResults.length) {
      const firstBookId = searchResults[0]?.id ?? 1

      void navigate(`/${ROUTE.BOOK}?id=${firstBookId}`)
    }
  }

  return (
    <StyledForm ref={searchRef}>
      <Formik
        initialValues={{ search: '' }}
        validationSchema={searchSchema}
        onSubmit={handleSubmit}>
        {({ values, handleChange, handleBlur, resetForm }) => (
          <Form>
            <SearchField
              id="search-books"
              type="text"
              name="search"
              aria-label="search"
              aria-busy={isSearching}
              placeholder="What are you looking for?"
              autoComplete="off"
              onChange={(e) => handleSearchChange(e, handleChange)}
              onClick={handleClick}
              onBlur={handleBlur}
              value={values.search}
            />
            <Dropdown $show={searchOpen && !isSearching}>
              {isSearching ? null : searchError ? (
                <DropdownList>
                  <NoResults role="alert">{searchError}</NoResults>
                </DropdownList>
              ) : searchResults.length ? (
                <DropdownList>
                  {searchResults.map((book) => (
                    <li key={book.id}>
                      <Link
                        to={`/${ROUTE.BOOK}?id=${book.id}`}
                        onClick={() => {
                          resetForm()
                          handleReset()
                        }}>
                        <MenuItem>
                          <img
                            src={book.imgUrl}
                            onError={(e) =>
                              ((e.target as HTMLImageElement).src =
                                imagePlaceholder)
                            }
                            alt={book.title}
                            width="24"
                            height="24"
                          />
                          <div>
                            <TextBold>{book.title}</TextBold>
                            <p>
                              <i>by </i>
                              <span>{book.author}</span>
                            </p>
                          </div>
                          <LinkIcon width="16" height="16" />
                        </MenuItem>
                      </Link>
                    </li>
                  ))}
                </DropdownList>
              ) : (
                <DropdownList>
                  <NoResults>No search results...</NoResults>
                </DropdownList>
              )}
            </Dropdown>
            <SearchButton
              type="submit"
              title="Search"
              aria-label="Search"
              aria-busy={isSearching}>
              {isSearching ? (
                <SpinnerIcon width={16} height={16} aria-hidden="true" />
              ) : (
                <SearchIcon color="var(--color-on-surface-variant)" />
              )}
            </SearchButton>
            {values.search && (
              <ClearButton
                type="reset"
                onClick={() => {
                  handleReset()
                  document.getElementById('search-books')?.focus()
                }}
                title="Clear">
                <XMarkIcon color="var(--color-on-surface-variant)" />
              </ClearButton>
            )}
          </Form>
        )}
      </Formik>
    </StyledForm>
  )
}
