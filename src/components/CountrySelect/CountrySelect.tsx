import { useEffect, useRef, useState } from 'react'
import { useFormikContext } from 'formik'
import { getCountryCodes } from '@/api'
import { useClickOutside } from '@/hooks'
import { defaultCountry } from '@/constants'
import type { CountryData } from '@/types'
import { CaretDownIcon } from '@/assets/svg'
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
  const [countries, setCountries] = useState<CountryData>({})
  const meta = getFieldMeta(fieldName)
  const formCountry =
    typeof meta.value === 'string'
      ? meta.value.toLowerCase()
      : initial.toLowerCase()
  const [selectedCountry, setSelectedCountry] = useState(formCountry)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    const fetchCountries = async () => {
      const data = await getCountryCodes()
      setCountries(data)
    }
    void fetchCountries()
  }, [])

  const countryList = Object.entries(countries).filter(([, name]) => {
    if (!searchQuery) return true
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getFlagUrl = (code: string) => {
    return `https://flagcdn.com/${code.toLowerCase()}.svg`
  }

  const onInputClick = () => {
    if (readOnly) return
    setIsOpen((prev) => !prev)
  }

  const onSelect = (code: string) => {
    if (readOnly) return
    setSelectedCountry(code)
    void setFieldValue(fieldName, code, false)
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
        readOnly={readOnly}>
        <div>
          <CountryFlag
            src={getFlagUrl(selectedCountry)}
            alt={`${countryName} flag`}
            loading="lazy"
          />
          <CountryName>{countryName}</CountryName>
        </div>
        <CaretDownIcon />
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
            {countryList.length > 0 ? (
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
