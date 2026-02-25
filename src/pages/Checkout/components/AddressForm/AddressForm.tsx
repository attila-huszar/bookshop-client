import { AddressElement } from '@stripe/react-stripe-js'
import { userSelector } from '@/store'
import { useAppSelector } from '@/hooks'
import { defaultCountry, googleMapsKey } from '@/constants'
import type { StripeAddressElementOptions } from '@/types'

export function AddressForm() {
  const { userData } = useAppSelector(userSelector)

  const addressOptions: StripeAddressElementOptions = {
    mode: 'shipping',
    fields: { phone: 'always' },
    ...(userData && {
      defaultValues: {
        name: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone,
        address: {
          line1: userData.address?.line1,
          line2: userData.address?.line2,
          city: userData.address?.city,
          state: userData.address?.state,
          postal_code: userData.address?.postal_code,
          country: userData.address?.country ?? defaultCountry,
        },
      },
    }),
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

  return <AddressElement options={addressOptions} className="stripe-form" />
}
