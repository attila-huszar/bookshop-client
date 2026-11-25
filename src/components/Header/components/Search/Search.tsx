import {
  type KeyboardEvent,
  type SubmitEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { ROUTE } from '@/routes/route'
import { booksApi } from '@/store/api/booksApi'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import { CacheTime, uiTiming } from '@/constants/time'
import { validationLimits } from '@/constants/validation'
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
  SearchStatus,
  StyledForm,
  TextBold,
} from './Search.style'
import { useBookSearch } from './useBookSearch'

export function Search() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const prefetchBook = booksApi.usePrefetch('book', {
    ifOlderThan: CacheTime.FiveMinutes,
  })
  const prefetchBookOnHover = useDebouncedCallback(
    prefetchBook,
    uiTiming.prefetchDelayMs,
  )
  const prefetchBookOnFocus = useDebouncedCallback(
    prefetchBook,
    uiTiming.prefetchDelayMs,
  )
  const {
    searchValue,
    hasQuery,
    currentResponse,
    isSearching,
    updateSearchValue,
  } = useBookSearch()

  const [searchOpen, setSearchOpen] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLUListElement>(null)
  const resultToFocus = useRef<HTMLAnchorElement | null>(null)
  const searchResults = currentResponse?.books ?? []
  const showResults = searchOpen && !isSearching

  useClickOutside(searchRef, () => setSearchOpen(false))

  useLayoutEffect(() => {
    if (!showResults) {
      return
    }

    const result = resultToFocus.current
    resultToFocus.current = null
    result?.focus()

    return () => {
      prefetchBookOnHover.cancel()
      prefetchBookOnFocus.cancel()
    }
  }, [prefetchBookOnHover, prefetchBookOnFocus, showResults])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextQuery = updateSearchValue(e.target.value)

    if (nextQuery !== undefined) {
      setSearchOpen(nextQuery.length > 1)
    }
  }

  const handleReset = () => {
    updateSearchValue('')
    setSearchOpen(false)
  }

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const firstBook = searchResults[0]

    if (firstBook) {
      void navigate(`/${ROUTE.BOOK}?id=${firstBook.id}`)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.defaultPrevented || event.nativeEvent.isComposing) {
      return
    }

    if (event.key === 'Escape' && searchOpen) {
      event.preventDefault()
      inputRef.current?.focus()
      setSearchOpen(false)

      return
    }

    const isDown = event.key === 'ArrowDown'

    if (
      (!isDown && event.key !== 'ArrowUp') ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return
    }

    const links = Array.from(
      resultsRef.current?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? [],
    )
    let nextFocus: HTMLElement | null | undefined

    if (event.target === inputRef.current) {
      const result = isDown ? links[0] : links.at(-1)

      if (!searchOpen && hasQuery) {
        event.preventDefault()
        resultToFocus.current = result ?? null
        setSearchOpen(true)

        return
      }

      nextFocus = result
    } else {
      const index = links.findIndex((link) => link === event.target)

      if (index === -1) {
        return
      }

      nextFocus =
        !isDown && index === 0
          ? inputRef.current
          : links[index + (isDown ? 1 : -1)]
    }

    if (nextFocus) {
      event.preventDefault()
      nextFocus.focus()
    }
  }

  return (
    <StyledForm ref={searchRef}>
      <form
        role="search"
        onSubmit={handleSubmit}
        onReset={handleReset}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setSearchOpen(false)
          }
        }}
        onKeyDown={handleKeyDown}>
        <SearchField
          ref={inputRef}
          id="search-books"
          type="text"
          name="search"
          aria-label={t('catalogue.search')}
          aria-busy={isSearching}
          placeholder={t('catalogue.searchPlaceholder')}
          autoComplete="off"
          maxLength={validationLimits.search.maxLength}
          $showResults={showResults}
          onChange={handleSearchChange}
          onClick={() => setSearchOpen(hasQuery)}
          value={searchValue}
        />
        <SearchStatus aria-live="polite" aria-atomic="true">
          {showResults && currentResponse && !currentResponse.hasError
            ? t('catalogue.searchResultsCount', { count: searchResults.length })
            : null}
        </SearchStatus>
        <Dropdown $show={showResults}>
          {!isSearching && (
            <DropdownList ref={resultsRef}>
              {currentResponse?.hasError ? (
                <NoResults role="alert">{t('catalogue.searchError')}</NoResults>
              ) : searchResults.length ? (
                searchResults.map((book) => (
                  <li key={book.id}>
                    <Link
                      to={`/${ROUTE.BOOK}?id=${book.id}`}
                      onMouseEnter={() => prefetchBookOnHover(book.id)}
                      onMouseLeave={prefetchBookOnHover.cancel}
                      onFocus={() => prefetchBookOnFocus(book.id)}
                      onBlur={prefetchBookOnFocus.cancel}
                      onClick={handleReset}>
                      <MenuItem>
                        <img
                          src={book.imgUrl}
                          onError={(e) =>
                            (e.currentTarget.src = imagePlaceholder)
                          }
                          alt=""
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
                        <LinkIcon width="16" height="16" aria-hidden="true" />
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
            <SearchIcon width={16} height={16} aria-hidden="true" />
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
