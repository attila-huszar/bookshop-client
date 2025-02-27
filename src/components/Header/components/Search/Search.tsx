import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { searchSchema } from '@/helpers'
import {
  useDebounce,
  useClickOutside,
  useAppDispatch,
  useAppSelector,
} from '@/hooks'
import {
  authorsSelector,
  fetchAuthorsBySearch,
  fetchBooksByAuthor,
  fetchBooksBySearch,
} from '@/store'
import { PATH } from '@/constants'
import { IAuthor, IBook } from '@/interfaces'
import LinkIcon from '@/assets/svg/link.svg?react'
import imagePlaceholder from '@/assets/svg/image_placeholder.svg'

export function Search() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<IBook[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useAppDispatch()
  const { authorArray } = useAppSelector(authorsSelector)
  const navigate = useNavigate()
  const debouncedSearchResults = useDebounce(getSearchResults)
  const initialValues = { search: '' }
  useClickOutside(searchRef, searchOpen, setSearchOpen)

  async function getSearchResults(searchString: string) {
    if (searchString.length > 1) {
      let booksSearched: IBook[] = []
      let authorsSearched: IAuthor[] = []

      const booksSearchResponse = await dispatch(
        fetchBooksBySearch(searchString),
      )

      const authorsSearchResponse = await dispatch(
        fetchAuthorsBySearch(searchString),
      )

      if (booksSearchResponse.payload) {
        booksSearched = booksSearchResponse.payload as IBook[]
      }

      if (authorsSearchResponse.payload) {
        authorsSearched = authorsSearchResponse.payload as IAuthor[]
      }

      if (authorsSearched.length) {
        const authorsMatched = await Promise.allSettled(
          authorsSearched.map((author) =>
            dispatch(fetchBooksByAuthor(author.id)),
          ),
        )

        authorsMatched.forEach((book) => {
          if (book.status === 'fulfilled') {
            const newBooks = book.value.payload as IBook[]
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

  const handleReset = (values: { search: string }) => {
    setSearchOpen(false)
    values.search = ''
    setSearchResults([])
  }

  const handleSubmit = () => {
    if (searchResults.length) {
      navigate(`/${PATH.books}/${searchResults[0].id}`)
    }
  }

  const getAuthorName = (authorId: number, authorArray: IAuthor[]) => {
    const author = authorArray?.find((author) => author.id === authorId)
    return author ? author.name : 'Unknown Author'
  }

  return (
    <StyledForm ref={searchRef}>
      <Formik
        initialValues={initialValues}
        validationSchema={searchSchema}
        onSubmit={handleSubmit}>
        {({ values, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <SearchField
              ref={inputRef}
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
                        to={`/${PATH.books}/${book.id}`}
                        onClick={() => handleReset(values)}>
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
                              <span>
                                {getAuthorName(book.author, authorArray)}
                              </span>
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
              disabled={isSubmitting}
              title="Search"
            />
            <ClearButton
              type="button"
              onClick={() => {
                handleReset(values)
                inputRef.current?.focus()
              }}
              title="Clear"
            />
          </Form>
        )}
      </Formik>
    </StyledForm>
  )
}
