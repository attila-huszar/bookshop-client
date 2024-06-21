import { AddressElement } from '@stripe/react-stripe-js'
import { useAppSelector } from 'hooks'
import { userSelector } from 'store'
import { googleMapsKey } from 'lib'

export function AddressForm() {
  const { userData } = useAppSelector(userSelector)

  console.log(googleMapsKey)

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
              line1: userData?.address.street,
              line2: userData?.address.number,
              city: userData?.address.city,
              state: userData?.address.state,
              postal_code: userData?.address.postCode,
              country: userData?.address.country,
            },
          },
          autocomplete: {
            mode: 'google_maps_api',
            apiKey: googleMapsKey,
          },
        }}
        onChange={(event) => {
          if (event.complete) {
            const address = event.value.address
          }
        }}
      />
    </form>
  )
}
