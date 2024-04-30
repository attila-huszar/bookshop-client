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
import { debounce } from '../../../../utils/debounce'
import { IBook } from '../../../../interfaces'
import LinkIcon from './../../../../assets/svg/link-square-02-stroke-rounded'
import { searchSchema } from '../../../../utils/validationSchema'

export function Search() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([] as IBook[])
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const closeDropdown = () => {
    setDropdownOpen(false)
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

  const handleSearch = async (searchString: string) => {
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

  const handleClick = () => {
    if (searchResults.length) {
      setDropdownOpen(true)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  const initialValues = { search: '' }

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
              onChange={(e) => {
                handleChange(e)
                debounce(handleSearch(e.target.value))
              }}
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
                      <Link to={`/${BOOKS}/${book.id}`} onClick={closeDropdown}>
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
            <ClearButton
              type="button"
              onClick={() => {
                values.search = ''
                setDropdownOpen(false)
              }}
            />
          </Form>
        )}
      </Formik>
    </StyledForm>
  )
}
