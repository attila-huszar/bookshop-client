import { useMemo } from 'react'
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { stripeKey } from 'services'
import { useAppSelector } from 'hooks'
import { orderSelector } from 'store'
import { StyledCheckout } from './Checkout.styles'
import { CheckoutForm } from './components/CheckoutForm/CheckoutForm'
import { AddressForm } from './components/AddressForm/AddressForm'
import { PaymentStatus } from './components/PaymentStatus/PaymentStatus'
import { Error } from 'components'

const stripePromise = loadStripe(stripeKey)
const loader = 'auto'

export function Checkout() {
  const { orderStatus, orderError } = useAppSelector(orderSelector)

  const redirectStatus = useMemo(
    () => new URLSearchParams(window.location.search).get('redirect_status'),
    [],
  )

  const options: StripeElementsOptions = {
    clientSecret: orderStatus?.clientSecret,
    appearance: {
      theme: 'flat',
      variables: {},
    },
    loader,
  }

  function renderContent() {
    if (redirectStatus === 'succeeded') {
      return <PaymentStatus />
    } else if (
      orderStatus.clientSecret &&
      orderStatus.amount &&
      orderStatus.currency
    ) {
      return (
        <>
          <AddressForm />
          <CheckoutForm
            amount={orderStatus.amount / 100}
            currency={orderStatus.currency}
            orderNum={orderStatus.clientSecret
              .split('_secret_')[0]
              .slice(-6)
              .toUpperCase()}
          />
        </>
      )
    } else {
      return <Error text="No checkout in progress" error={orderError} />
    }
  }

  return (
    <StyledCheckout>
      <Elements
        options={options}
        stripe={stripePromise}
        key={orderStatus?.clientSecret}>
        {renderContent()}
      </Elements>
    </StyledCheckout>
  )
}
