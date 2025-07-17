import { AddressElement } from '@stripe/react-stripe-js'
import { Address } from '@stripe/stripe-js'
import { useAppSelector } from '@/hooks'
import { userSelector } from '@/store'
import { googleMapsKey } from '@/constants'

export function AddressForm() {
  const { userData } = useAppSelector(userSelector)
  const address: Partial<Address> = userData?.address ?? {}

  return (
    <form>
      <AddressElement
        options={{
          mode: 'shipping',
          display: { name: 'split' },
          fields: { phone: 'always' },
          defaultValues: {
            firstName: userData?.firstName,
            lastName: userData?.lastName,
            phone: userData?.phone,
            address: {
              line1: address?.line1,
              line2: address?.line2,
              city: address?.city,
              state: address?.state,
              postal_code: address?.postal_code,
              country: address?.country ?? 'US',
            },
          },
          autocomplete: {
            mode: 'google_maps_api',
            apiKey: googleMapsKey,
          },
        }}
      />
    </form>
  )
}
