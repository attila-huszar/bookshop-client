import { AddressElement } from '@stripe/react-stripe-js'
import { useAppSelector } from '@/hooks'
import { userSelector } from '@/store'
import { googleMapsKey } from '@/constants'

export function AddressForm() {
  const { userData } = useAppSelector(userSelector)
  const { firstName, lastName, phone, address: userAddress } = userData ?? {}
  const {
    line1,
    line2,
    city,
    state,
    postal_code,
    country: userCountry,
  } = userAddress ?? {}

  // Get country from user data, or detect from browser locale, or default to US
  const getCountry = () => {
    if (userCountry) return userCountry
    // Try to detect from browser locale (e.g., 'en-US' -> 'US')
    const locale = navigator.language || navigator.languages?.[0]
    const countryCode = locale?.split('-')[1]?.toUpperCase()
    return countryCode || 'US'
  }

  const country = getCountry()

  // Build address element options with conditional autocomplete
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
        country,
      },
    },
  }

  // Only add Google Maps autocomplete if key is available
  if (googleMapsKey) {
    addressOptions.autocomplete = {
      mode: 'google_maps_api',
      apiKey: googleMapsKey,
    }
  } else {
    // Fallback to browser autocomplete if Google Maps key is missing
    addressOptions.autocomplete = {
      mode: 'automatic',
    }
  }

  return (
    <form>
      <AddressElement options={addressOptions} />
    </form>
  )
}
