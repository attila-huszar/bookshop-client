import { AddressElement } from '@stripe/react-stripe-js'
import { userSelector } from '@/store'
import { useAppSelector } from '@/hooks'
import { defaultCountry, googleMapsKey } from '@/constants'
import type { PaymentIntentShipping, StripeAddressChange } from '@/types'

type AddressFormProps = {
  onAddressChange: (shipping: PaymentIntentShipping | null) => void
}

export function AddressForm({ onAddressChange }: AddressFormProps) {
  const { userData } = useAppSelector(userSelector)

  const handleAddressChange = (event: StripeAddressChange) => {
    if (!event.complete || !event.value) {
      onAddressChange(null)
      return
    }

    const { name, phone, address } = event.value

    onAddressChange({
      name,
      phone,
      address: {
        line1: address.line1,
        line2: address.line2 ?? '',
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
      },
    })
  }

  const addressOptions: Parameters<typeof AddressElement>[0]['options'] = {
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

  return (
    <form>
      <AddressElement options={addressOptions} onChange={handleAddressChange} />
    </form>
  )
}
