import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useElements, useStripe } from '@stripe/react-stripe-js'
import { ROUTE } from '@/routes'
import { baseURL } from '@/constants'
import { handleError } from '@/errors'
import { useMessages } from './useMessages'

type UsePaymentSubmitParams = {
  receiptEmail: string
}

type UsePaymentSubmitReturn = {
  isLoading: boolean
  message: string | undefined
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
}

export function usePaymentSubmit({
  receiptEmail,
}: UsePaymentSubmitParams): UsePaymentSubmitReturn {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { getErrorMessage } = useMessages()

  const [message, setMessage] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()

    if (!stripe || !elements) {
      setMessage(
        'Payment system is not ready. Please wait a moment and try again.',
      )
      return
    }

    setIsLoading(true)
    setMessage(undefined)

    try {
      const addressElement = elements.getElement('address')
      const addressData = addressElement
        ? await addressElement.getValue()
        : null

      if (addressData && !addressData.complete) {
        setMessage('Please complete the shipping address form.')
        setIsLoading(false)
        return
      }

      const shipping = addressData?.value
        ? {
            name: `${addressData.value.firstName ?? ''} ${addressData.value.lastName ?? ''}`.trim(),
            phone: addressData.value.phone ?? '',
            address: {
              line1: addressData.value.address.line1,
              line2: addressData.value.address.line2 ?? '',
              city: addressData.value.address.city,
              state: addressData.value.address.state,
              postal_code: addressData.value.address.postal_code,
              country: addressData.value.address.country,
            },
          }
        : null

      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: receiptEmail,
          return_url: `${baseURL}/${ROUTE.CHECKOUT}`,
          shipping,
        },
        redirect: 'if_required',
      })

      if (error) {
        setMessage(getErrorMessage(error))
        return
      }

      if (paymentIntent) {
        void navigate(`/${ROUTE.CHECKOUT}`, {
          replace: true,
          state: { showPaymentStatus: true },
        })
      }
    } catch (error) {
      const formattedError = await handleError({
        error,
        message: 'Failed to process payment. Please try again.',
      })
      setMessage(formattedError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, message, handleSubmit }
}
