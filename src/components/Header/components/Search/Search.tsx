import { useCallback, useEffect, useRef, useState } from 'react'
import { Formik } from 'formik'
import {
  StyledForm,
  SearchButton,
  SearchField,
  Dropdown,
  DropdownList,
  MenuItem,
} from './Search.styles'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../../../hooks'
import { booksSelector } from '../../../../store'
import { BOOKS } from '../../../../routes/pathConstants'
import LinkIcon from './../../../../assets/svg/link-square-02-stroke-rounded'

export function Search() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { booksRandomize } = useAppSelector(booksSelector)

  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState)
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
        initialValues={{ search: '' }}
        validate={(values) => {
          const errors = { search: '' }
          if (!/^[A-Z0-9.'-]+$/i.test(values.search)) {
            errors.search = 'Invalid search string'
          }
          return errors
        }}
        onSubmit={() => {}}>
        {({
          values,
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <SearchField
              type="text"
              name="search"
              placeholder="What are you looking for?"
              autoComplete="off"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.search}
              onClick={toggleDropdown}
              $error={!!values.search && !!errors.search}
            />
            <Dropdown
              $show={dropdownOpen}
              $error={!!values.search && !!errors.search}>
              <DropdownList>
                {booksRandomize.map((book) => (
                  <li key={book.id}>
                    <Link to={`/${BOOKS}/${book.id}`} onClick={toggleDropdown}>
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
            </Dropdown>
            <SearchButton type="submit" disabled={isSubmitting} />
          </form>
        )}
      </Formik>
    </StyledForm>
  )
}
