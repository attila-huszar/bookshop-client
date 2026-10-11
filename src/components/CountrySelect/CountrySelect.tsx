import { useEffect, useRef, useState } from 'react'
import { useFormikContext } from 'formik'
import { useCountryCodesQuery } from '@/store/api/bookshopApi'
import { useClickOutside } from '@/hooks'
import { defaultCountry } from '@/constants'
import { ChevronDownIcon } from '@/assets/svg'
import { ErrorMessage, InputWrapper } from '@/styles'
import {
  CountryFlag,
  CountryName,
  DropdownList,
  OptionItem,
  OptionsList,
  SearchInput,
  SelectedOption,
} from './CountrySelect.style'

interface CountrySelectProps {
  initial?: string
  fieldName?: string
  readOnly?: boolean
}

export function CountrySelect({
  initial = defaultCountry,
  fieldName = 'country',
  readOnly = false,
}: CountrySelectProps) {
  const { setFieldValue, getFieldMeta, submitCount } =
    useFormikContext<Record<string, unknown>>()
  const {
    data: countries = {},
    isLoading,
    isError,
  } = useCountryCodesQuery({
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const meta = getFieldMeta(fieldName)
  const selectedCountry =
    typeof meta.value === 'string'
      ? meta.value.toLowerCase()
      : initial.toLowerCase()
  const hasSelection = Boolean(selectedCountry)
  const countryName = countries[selectedCountry]

  useClickOutside(dropdownRef, () => setIsOpen(false))

  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedItem = listRef.current.querySelector(
        '[aria-selected="true"]',
      )
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' })
      }
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    } else if (!isOpen) {
      const timeoutId = setTimeout(() => setSearchQuery(''), 200)

      return () => clearTimeout(timeoutId)
    }
  }, [isOpen])

  const countryList = Object.entries(countries).filter(([, name]) => {
    if (!searchQuery) {
      return true
    }

    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getFlagUrl = (code: string) => {
    return `https://flagcdn.com/${code.toLowerCase()}.svg`
  }

  const onInputClick = () => {
    if (readOnly) {
      return
    }

    setIsOpen((prev) => !prev)
  }

  const onSelect = (code: string) => {
    if (readOnly) {
      return
    }

    void setFieldValue(fieldName, code, true)
    setIsOpen(false)
  }

  const shouldShowError = meta.touched && submitCount > 0
  const errorMessage = meta.error

  return (
    <InputWrapper ref={dropdownRef}>
      <SelectedOption
        onClick={onInputClick}
        $valid={shouldShowError && !errorMessage}
        $error={shouldShowError && errorMessage}
        aria-busy={isLoading}
        readOnly={readOnly}>
        <div>
          {hasSelection && (
            <CountryFlag
              src={getFlagUrl(selectedCountry)}
              alt={`${countryName ?? selectedCountry} flag`}
              loading="lazy"
            />
          )}
          <CountryName>
            {countryName ??
              (hasSelection
                ? selectedCountry.toUpperCase()
                : 'Select country...')}
          </CountryName>
        </div>
        <ChevronDownIcon />
      </SelectedOption>
      {isOpen && !readOnly && (
        <DropdownList>
          <SearchInput
            ref={searchInputRef}
            type="text"
            placeholder="Search country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <OptionsList ref={listRef}>
            {isLoading ? (
              <OptionItem as="div" role="status" style={{ cursor: 'default' }}>
                Loading countries…
              </OptionItem>
            ) : isError ? (
              <OptionItem as="div" role="alert" style={{ cursor: 'default' }}>
                Could not load countries
              </OptionItem>
            ) : countryList.length > 0 ? (
              countryList.map(([code, countryName]) => (
                <OptionItem
                  key={code}
                  onClick={() => onSelect(code)}
                  $selected={code === selectedCountry}
                  aria-selected={code === selectedCountry}>
                  <CountryFlag
                    src={getFlagUrl(code)}
                    alt={`${countryName} flag`}
                    loading="lazy"
                  />
                  <CountryName>{countryName}</CountryName>
                </OptionItem>
              ))
            ) : (
              <OptionItem as="div" style={{ cursor: 'default' }}>
                No countries found
              </OptionItem>
            )}
          </OptionsList>
        </DropdownList>
      )}
      {shouldShowError && errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
    </InputWrapper>
  )
}
