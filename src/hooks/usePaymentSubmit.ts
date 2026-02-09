import { SubmitEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { useElements, useStripe } from '@stripe/react-stripe-js'
import { ROUTE } from '@/routes'
import { baseURL } from '@/constants'
import { handleError } from '@/errors'
import type { PaymentIntentShipping } from '@/types'
import { useMessages } from './useMessages'

type UsePaymentSubmitParams = {
  receiptEmail: string
  shipping: PaymentIntentShipping | null
}

type UsePaymentSubmitReturn = {
  isLoading: boolean
  message: string | undefined
  handleSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>
}

export function usePaymentSubmit({
  receiptEmail,
  shipping,
}: UsePaymentSubmitParams): UsePaymentSubmitReturn {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { getErrorMessage } = useMessages()

  const [message, setMessage] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>,
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

    if (!receiptEmail) {
      setMessage('Please enter your email address to proceed with payment.')
      setIsLoading(false)
      return
    }

    try {
      if (!shipping) {
        setMessage('Please complete the shipping address form.')
        setIsLoading(false)
        return
      }

      const { name, phone, address } = shipping

      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: receiptEmail,
          payment_method_data: {
            billing_details: {
              email: receiptEmail,
              name,
              phone,
              address,
            },
          },
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
