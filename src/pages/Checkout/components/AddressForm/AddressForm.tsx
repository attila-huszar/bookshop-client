import { AddressElement } from '@stripe/react-stripe-js'
import { useAppSelector } from '@/hooks'
import { userSelector } from '@/store'
import { googleMapsKey } from '@/constants'

export function AddressForm() {
  const { userData } = useAppSelector(userSelector)

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
              line1: userData?.address.line1,
              line2: userData?.address.line2,
              city: userData?.address.city,
              state: userData?.address.state,
              postal_code: userData?.address.postal_code,
              country: userData?.address.country ?? 'US',
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
