import { useCallback, useEffect, useRef, useState } from 'react'
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
import { BOOKS } from '../../../../routes/pathConstants'
import { getBooksBySearch } from '../../../../api/fetchData'
import { IBook } from '../../../../interfaces'
import { searchSchema } from '../../../../utils/validationSchema'
import { useDebounce } from '../../../../hooks'
import LinkIcon from './../../../../assets/svg/link-square-02-stroke-rounded'

export function Search() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([] as IBook[])
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const debouncedSearchResults = useDebounce(getSearchResults)
  const initialValues = { search: '' }

  async function getSearchResults(searchString: string) {
    if (searchString.length) {
      const responseBooks = getBooksBySearch(searchString)
      const books = await responseBooks

      setSearchResults(books)
      setDropdownOpen(true)
    } else {
      setSearchResults([])
      setDropdownOpen(false)
    }
  }

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  ) => {
    handleChange(e)
    debouncedSearchResults(e.target.value)
  }

  const handleClose = (values: { search: string }) => {
    values.search = ''
    setDropdownOpen(false)
  }

  const handleClick = () => {
    if (searchResults.length) {
      setDropdownOpen(true)
    }
  }

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        dropdownOpen &&
        !searchRef.current?.contains(event.target as Element)
      ) {
        setDropdownOpen(false)
      }
    },
    [dropdownOpen],
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <StyledForm ref={searchRef}>
      <Formik
        initialValues={initialValues}
        validationSchema={searchSchema}
        onSubmit={(_, { setSubmitting }) => {
          if (searchResults.length) {
            navigate(`/${BOOKS}/${searchResults[0].id}`)
          }

          setTimeout(() => {
            setSubmitting(false)
          }, 500)
        }}>
        {({ values, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <SearchField
              type="text"
              name="search"
              placeholder="What are you looking for?"
              autoComplete="off"
              onChange={(e) => handleSearchChange(e, handleChange)}
              onClick={handleClick}
              onBlur={handleBlur}
              value={values.search}
              $error={!!values.search && !searchResults.length}
            />
            <Dropdown
              $show={dropdownOpen}
              $error={!!values.search && !searchResults.length}>
              {searchResults.length ? (
                <DropdownList>
                  {searchResults.map((book) => (
                    <li key={book.id}>
                      <Link
                        to={`/${BOOKS}/${book.id}`}
                        onClick={() => handleClose(values)}>
                        <MenuItem>
                          <img
                            src={book.imgUrl}
                            alt={book.title}
                            width="24"
                            height="24"
                          />
                          <span>{book.title}</span>
                          <LinkIcon />
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
            <ClearButton type="button" onClick={() => handleClose(values)} />
          </Form>
        )}
      </Formik>
    </StyledForm>
  )
}
