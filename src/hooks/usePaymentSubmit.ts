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
  handleSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>
  message: string | null
  setMessage: (message: string | null) => void
  isLoading: boolean
}

export function usePaymentSubmit({
  receiptEmail,
  shipping,
}: UsePaymentSubmitParams): UsePaymentSubmitReturn {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { getErrorMessage } = useMessages()
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()
    setMessage(null)
    setIsLoading(true)

    if (!stripe || !elements) {
      setMessage(
        'Payment system is not ready. Please wait a moment and try again.',
      )
      setIsLoading(false)
      return
    }

    if (!shipping) {
      setMessage(
        'Shipping information is missing. Please complete the address form.',
      )
      setIsLoading(false)
      return
    }

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: receiptEmail,
          shipping,
          return_url: `${baseURL}/${ROUTE.CHECKOUT}`,
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

  return {
    handleSubmit,
    message,
    setMessage,
    isLoading,
  }
}
