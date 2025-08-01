import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { Formik, Form } from 'formik'
import {
  StyledForm,
  SearchButton,
  SearchField,
  Dropdown,
  DropdownList,
  MenuItem,
  TextBold,
  NoResults,
  ClearButton,
} from './Search.style'
import { searchSchema } from '@/validation'
import { useDebounce, useClickOutside, useAppDispatch } from '@/hooks'
import {
  fetchBooksByAuthor,
  fetchBooksBySearch,
  fetchAuthorsBySearch,
} from '@/store'
import { ROUTE } from '@/routes'
import type { Author, Book } from '@/types'
import { SearchIcon, XMarkIcon, LinkIcon, imagePlaceholder } from '@/assets/svg'

export function Search() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const debouncedSearchResults = useDebounce(getSearchResults)
  const initialValues = { search: '' }
  useClickOutside({ ref: searchRef, state: searchOpen, setter: setSearchOpen })

  async function getSearchResults(searchString: string) {
    if (searchString.length > 1) {
      let booksSearched: Book[] = []
      let authorsSearched: Author[] = []

      const booksSearchResponse = await dispatch(
        fetchBooksBySearch(searchString),
      )

      const authorsSearchResponse = await dispatch(
        fetchAuthorsBySearch(searchString),
      )

      if (booksSearchResponse.payload) {
        booksSearched = booksSearchResponse.payload as Book[]
      }

      if (authorsSearchResponse.payload) {
        authorsSearched = authorsSearchResponse.payload as Author[]
      }

      if (authorsSearched.length) {
        const authorsMatched = await Promise.allSettled(
          authorsSearched.map((author) =>
            dispatch(fetchBooksByAuthor(author.id)),
          ),
        )

        authorsMatched.forEach((book) => {
          if (book.status === 'fulfilled') {
            const newBooks = book.value.payload as Book[]
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

      setSearchResults(booksSearched)
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
    debouncedSearchResults(e.target.value)
  }

  const handleClick = () => {
    if (searchResults.length) {
      setSearchOpen(true)
    }
  }

  const handleReset = () => {
    setSearchOpen(false)
    setSearchResults([])
  }

  const handleSubmit = async () => {
    if (searchResults.length) {
      await navigate(`/${ROUTE.BOOKS}/${searchResults[0].id}`)
    }
  }

  return (
    <StyledForm ref={searchRef}>
      <Formik
        initialValues={initialValues}
        validationSchema={searchSchema}
        onSubmit={handleSubmit}>
        {({ values, handleChange, handleBlur, resetForm }) => (
          <Form>
            <SearchField
              id="search-books"
              type="text"
              name="search"
              aria-label="search"
              placeholder="What are you looking for?"
              autoComplete="off"
              onChange={(e) => handleSearchChange(e, handleChange)}
              onClick={handleClick}
              onBlur={handleBlur}
              value={values.search}
            />
            <Dropdown $show={searchOpen}>
              {searchResults.length ? (
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
            <SearchButton type="submit" title="Search">
              <SearchIcon color="#888888" />
            </SearchButton>
            {values.search && (
              <ClearButton
                type="reset"
                onClick={() => {
                  handleReset()
                  document.getElementById('search-books')?.focus()
                }}
                title="Clear">
                <XMarkIcon color="#888888" />
              </ClearButton>
            )}
          </Form>
        )}
      </Formik>
    </StyledForm>
  )
}
