import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormikContext } from 'formik'
import { useCountryCodesQuery } from '@/store/api/usersApi'
import { useClickOutside } from '@/hooks/useClickOutside'
import { getFlagUrl } from '@/helpers/getFlagUrl'
import { ChevronDownIcon } from '@/assets/svg'
import { ErrorMessage, InputWrapper } from '@/styles/form.styles'
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
  fieldName?: string
  readOnly?: boolean
}

export function CountrySelect({
  fieldName = 'country',
  readOnly = false,
}: CountrySelectProps) {
  const { t, i18n } = useTranslation()

  const {
    setFieldValue,
    setFieldTouched,
    getFieldMeta,
    submitCount,
    validateField,
  } = useFormikContext<Record<string, unknown>>()
  const previousLanguage = useRef(i18n.resolvedLanguage)

  useEffect(() => {
    if (previousLanguage.current === i18n.resolvedLanguage) {
      return
    }

    previousLanguage.current = i18n.resolvedLanguage
    const meta = getFieldMeta(fieldName)

    if (meta.error && (meta.touched || submitCount > 0)) {
      void validateField(fieldName)
    }
  }, [
    fieldName,
    getFieldMeta,
    i18n.resolvedLanguage,
    submitCount,
    validateField,
  ])

  const {
    data: countries = {},
    isLoading,
    isError,
  } = useCountryCodesQuery(undefined, {
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
    typeof meta.value === 'string' ? meta.value.toLowerCase() : ''
  const hasSelection = Boolean(selectedCountry)
  const displayNames = new Intl.DisplayNames([i18n.resolvedLanguage ?? 'en'], {
    type: 'region',
  })
  const localizedCountries = Object.fromEntries(
    Object.entries(countries).map(([code, name]) => [
      code,
      i18n.resolvedLanguage === 'hu'
        ? (displayNames.of(code.toUpperCase()) ?? name)
        : name,
    ]),
  )
  const countryName = localizedCountries[selectedCountry]

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

  const countryList = Object.entries(localizedCountries).filter(([, name]) => {
    if (!searchQuery) {
      return true
    }

    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

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

    void setFieldTouched(fieldName, true, false)
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
              alt={t('country.flag', {
                country: countryName ?? selectedCountry,
              })}
              loading="lazy"
            />
          )}
          <CountryName>
            {countryName ??
              (hasSelection
                ? selectedCountry.toUpperCase()
                : t('country.select'))}
          </CountryName>
        </div>
        <ChevronDownIcon />
      </SelectedOption>
      {isOpen && !readOnly && (
        <DropdownList>
          <SearchInput
            ref={searchInputRef}
            type="text"
            placeholder={t('country.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <OptionsList ref={listRef}>
            {isLoading ? (
              <OptionItem as="div" role="status" style={{ cursor: 'default' }}>
                {t('country.loading')}
              </OptionItem>
            ) : isError ? (
              <OptionItem as="div" role="alert" style={{ cursor: 'default' }}>
                {t('country.error')}
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
                    alt={t('country.flag', { country: countryName })}
                    loading="lazy"
                  />
                  <CountryName>{countryName}</CountryName>
                </OptionItem>
              ))
            ) : (
              <OptionItem as="div" style={{ cursor: 'default' }}>
                {t('country.empty')}
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
