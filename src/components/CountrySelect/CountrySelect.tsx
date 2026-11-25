import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormikContext } from 'formik'
import { useCountryCodesQuery } from '@/store/api/usersApi'
import { useClickOutside } from '@/hooks/useClickOutside'
import { getFlagUrl } from '@/helpers/getFlagUrl'
import { uiTiming } from '@/constants/time'
import { ChevronDownIcon } from '@/assets/svg'
import { ErrorMessage, InputWrapper } from '@/styles/form.styles'
import {
  CountryFlag,
  CountryName,
  DropdownList,
  DropdownStatus,
  OptionItem,
  OptionsList,
  SearchInput,
  SelectedOption,
} from './CountrySelect.style'

interface CountrySelectProps {
  fieldName?: string
  label?: string
  readOnly?: boolean
}

export function CountrySelect({
  fieldName = 'country',
  label,
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
  const [activeCountry, setActiveCountry] = useState('')
  const controlId = useId()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
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
  const countryName =
    localizedCountries[selectedCountry] ??
    (hasSelection ? selectedCountry.toUpperCase() : t('country.select'))

  const fieldLabel = label ?? t('common.fields.country')
  const labelId = `${controlId}-label`
  const valueId = `${controlId}-value`
  const popupId = `${controlId}-popup`
  const listId = `${controlId}-options`
  const errorId = `${controlId}-error`
  const showOptions = isOpen && !readOnly
  const normalizedQuery = searchQuery.toLowerCase()
  const countryList =
    isLoading || isError
      ? []
      : Object.entries(localizedCountries).filter(([, name]) =>
          name.toLowerCase().includes(normalizedQuery),
        )
  const activeIndex = countryList.findIndex(([code]) => code === activeCountry)
  const hasOptions = countryList.length > 0
  const activeOptionId =
    showOptions && activeIndex >= 0 ? `${listId}-${activeCountry}` : undefined
  const shouldShowError = meta.touched && submitCount > 0
  const error = shouldShowError ? meta.error : undefined

  useClickOutside(dropdownRef, () => setIsOpen(false))

  useEffect(() => {
    if (showOptions) {
      searchInputRef.current?.focus()

      return
    }

    const timeoutId = setTimeout(
      () => setSearchQuery(''),
      uiTiming.countrySearchResetMs,
    )

    return () => clearTimeout(timeoutId)
  }, [showOptions])

  useEffect(() => {
    if (activeOptionId) {
      document
        .getElementById(activeOptionId)
        ?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeOptionId])

  const closePicker = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  const onSelect = (code: string) => {
    void setFieldTouched(fieldName, true, false)
    void setFieldValue(fieldName, code, true)
    closePicker()
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) {
      return
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault()
        const lastIndex = countryList.length - 1
        const nextIndex =
          event.key === 'ArrowDown'
            ? Math.min(activeIndex + 1, lastIndex)
            : activeIndex < 0
              ? lastIndex
              : Math.max(activeIndex - 1, 0)
        setActiveCountry(countryList[nextIndex]?.[0] ?? '')
        break
      }
      case 'Enter':
        event.preventDefault()
        if (activeOptionId) {
          onSelect(activeCountry)
        }
        break
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        closePicker()
        break
    }
  }

  return (
    <>
      <p>
        <label id={labelId} htmlFor={controlId}>
          {fieldLabel}
        </label>
      </p>
      <InputWrapper
        ref={dropdownRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsOpen(false)
          }
        }}>
        <SelectedOption
          ref={triggerRef}
          id={controlId}
          type="button"
          disabled={readOnly}
          tabIndex={showOptions ? -1 : undefined}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-expanded={showOptions}
          aria-controls={showOptions ? popupId : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-busy={isLoading}
          $valid={shouldShowError && !error}
          $error={error}
          onClick={() => {
            setActiveCountry(selectedCountry)
            setIsOpen(!showOptions)
          }}
          onKeyDown={(event) => {
            if (
              !showOptions &&
              (event.key === 'ArrowDown' || event.key === 'ArrowUp')
            ) {
              event.preventDefault()
              const edge =
                event.key === 'ArrowDown' ? countryList[0] : countryList.at(-1)
              setActiveCountry(edge?.[0] ?? '')
              setIsOpen(true)
            }
          }}>
          <span>
            {hasSelection && !isLoading && (
              <CountryFlag
                src={getFlagUrl(selectedCountry)}
                alt=""
                loading="lazy"
              />
            )}
            <CountryName id={valueId}>
              {isLoading ? t('country.loading') : countryName}
            </CountryName>
          </span>
          <ChevronDownIcon aria-hidden="true" />
        </SelectedOption>
        {showOptions && (
          <DropdownList id={popupId}>
            <SearchInput
              ref={searchInputRef}
              type="text"
              role="combobox"
              aria-label={t('country.search')}
              aria-expanded={hasOptions}
              aria-autocomplete="list"
              aria-controls={hasOptions ? listId : undefined}
              aria-activedescendant={activeOptionId}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              placeholder={t('country.search')}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setActiveCountry('')
              }}
              onKeyDown={handleSearchKeyDown}
            />
            {hasOptions && (
              <OptionsList id={listId} role="listbox" aria-labelledby={labelId}>
                {countryList.map(([code, name]) => (
                  <OptionItem
                    id={`${listId}-${code}`}
                    key={code}
                    role="option"
                    aria-selected={code === activeCountry}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onSelect(code)}>
                    <CountryFlag src={getFlagUrl(code)} alt="" loading="lazy" />
                    <CountryName>{name}</CountryName>
                  </OptionItem>
                ))}
              </OptionsList>
            )}
            {isLoading ? (
              <DropdownStatus role="status">
                {t('country.loading')}
              </DropdownStatus>
            ) : isError ? (
              <DropdownStatus role="alert">{t('country.error')}</DropdownStatus>
            ) : (
              !hasOptions && (
                <DropdownStatus role="status">
                  {t('country.empty')}
                </DropdownStatus>
              )
            )}
          </DropdownList>
        )}
        {error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
      </InputWrapper>
    </>
  )
}
