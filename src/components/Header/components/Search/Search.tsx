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
  ErrorItem,
  ClearButton,
} from './Search.styles'
import { getBooksBySearch } from 'api/fetchData'
import { searchSchema } from 'helpers'
import { useDebounce, useClickOutside } from 'hooks'
import { PATH } from 'lib'
import { IBook } from 'interfaces'
import LinkIcon from 'assets/svg/link.svg?react'

export function Search() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([] as IBook[])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const debouncedSearchResults = useDebounce(getSearchResults)
  const initialValues = { search: '' }
  useClickOutside(searchRef, searchOpen, setSearchOpen)

  async function getSearchResults(searchString: string) {
    if (searchString.length) {
      const responseBooks = getBooksBySearch(searchString)
      const books = await responseBooks

      setSearchResults(books)
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
                            alt={book.title}
                            width="24"
                            height="24"
                          />
                          <span>{book.title}</span>
                          <LinkIcon width="16" height="16" />
                        </MenuItem>
                      </Link>
                    </li>
                  ))}
                </DropdownList>
              ) : (
                <DropdownList>
                  <ErrorItem>No search results...</ErrorItem>
                </DropdownList>
              )}
            </Dropdown>
            <SearchButton type="submit" disabled={isSubmitting} />
            <ClearButton
              type="button"
              onClick={() => {
                handleReset(values)
                inputRef.current?.focus()
              }}
            />
          </Form>
        )}
      </Formik>
    </StyledForm>
  )
}
