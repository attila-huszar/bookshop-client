import { useEffect, useState } from 'react'
import { AddressElement } from '@stripe/react-stripe-js'
import { useAppSelector } from '@/hooks'
import { userSelector } from '@/store'
import { getUserCountry } from '@/api'
import { defaultCountry, googleMapsKey } from '@/constants'

export function AddressForm() {
  const { userData } = useAppSelector(userSelector)
  const {
    firstName,
    lastName,
    phone,
    address: userAddress,
    country,
  } = userData ?? {}
  const { line1, line2, city, state, postal_code } = userAddress ?? {}
  const [fallbackCountry, setFallbackCountry] = useState<string>(defaultCountry)
  const [isLoadingCountry, setIsLoadingCountry] = useState(!country)

  useEffect(() => {
    if (!country) {
      getUserCountry()
        .then((data) => setFallbackCountry(data.country))
        .catch(() => setFallbackCountry(defaultCountry))
        .finally(() => setIsLoadingCountry(false))
    }
  }, [country])

  const userCountry = country ?? fallbackCountry

  const addressOptions: Parameters<typeof AddressElement>[0]['options'] = {
    mode: 'shipping',
    display: { name: 'split' },
    fields: { phone: 'always' },
    defaultValues: {
      firstName,
      lastName,
      phone,
      address: {
        line1,
        line2,
        city,
        state,
        postal_code,
        country: userCountry,
      },
    },
  }

  if (googleMapsKey) {
    addressOptions.autocomplete = {
      mode: 'google_maps_api',
      apiKey: googleMapsKey,
    }
  } else {
    addressOptions.autocomplete = {
      mode: 'automatic',
    }
  }

  if (isLoadingCountry) {
    return (
      <form>
        <p style={{ textAlign: 'center', padding: '1rem' }}>
          Loading address form...
        </p>
      </form>
    )
  }

  return (
    <form>
      <AddressElement options={addressOptions} />
    </form>
  )
}
