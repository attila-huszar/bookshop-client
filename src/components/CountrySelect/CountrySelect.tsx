import { useEffect, useRef, useState } from 'react'
import { Field, useFormikContext } from 'formik'
import { getCountryCodes } from '@/api'
import { InputWrapper, ErrorMessage } from '@/styles'
import { useClickOutside } from '@/hooks'
import {
  CustomSelectButton,
  SelectedFlag,
  ChevronIcon,
  DropdownList,
  DropdownItem,
  FlagImage,
} from './CountrySelect.style'
import type { CountryData, FormikProps } from '@/types'

interface CountrySelectProps {
  name: string
  defaultCountry: string
  readOnly?: boolean
}

export function CountrySelect({
  name,
  defaultCountry,
  readOnly,
}: CountrySelectProps) {
  const formikContext = useFormikContext<Record<string, string>>()
  const [countries, setCountries] = useState<CountryData>({})
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside({ ref: dropdownRef, state: isOpen, setter: setIsOpen })

  useEffect(() => {
    const fetchCountries = async () => {
      const data = await getCountryCodes()
      setCountries(data)
    }
    void fetchCountries()
  }, [])

  useEffect(() => {
    const currentValue = formikContext.values[name]
    if (!currentValue) {
      void formikContext.setFieldValue(name, defaultCountry)
    }
  }, [defaultCountry, name, formikContext])

  const countryEntries = Object.entries(countries)

  const getFlagUrl = (code: string) => {
    return `https://flagcdn.com/${code.toLowerCase()}.svg`
  }

  return (
    <Field name={name}>
      {({ field, form, meta }: FormikProps) => {
        const shouldShowError = meta.touched && form.submitCount > 0
        const selectedCountry = countries[field.value]

        const handleSelect = (code: string) => {
          void formikContext.setFieldValue(name, code)
          void formikContext.setFieldTouched(name, true)
          setIsOpen(false)
        }

        return (
          <InputWrapper ref={dropdownRef}>
            <CustomSelectButton
              type="button"
              $valid={shouldShowError && !meta.error}
              $error={shouldShowError && meta.error}
              $disabled={readOnly}
              onClick={() => !readOnly && setIsOpen(!isOpen)}>
              <SelectedFlag
                src={getFlagUrl(field.value)}
                alt={`${selectedCountry} flag`}
                loading="lazy"
              />
              <span>{selectedCountry}</span>
              <ChevronIcon $isOpen={isOpen}>▼</ChevronIcon>
            </CustomSelectButton>
            {shouldShowError && meta.error && (
              <ErrorMessage>{meta.error}</ErrorMessage>
            )}
            <DropdownList $isOpen={isOpen}>
              {countryEntries.map(([code, countryName]) => (
                <DropdownItem
                  key={code}
                  onClick={() => handleSelect(code)}
                  role="option"
                  aria-selected={field.value === code}>
                  <FlagImage
                    src={getFlagUrl(code)}
                    alt={`${countryName} flag`}
                    loading="lazy"
                  />
                  <span>{countryName}</span>
                </DropdownItem>
              ))}
            </DropdownList>
          </InputWrapper>
        )
      }}
    </Field>
  )
}
