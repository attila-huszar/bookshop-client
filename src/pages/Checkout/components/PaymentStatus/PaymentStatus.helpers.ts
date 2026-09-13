import type { CheckoutStatusText } from '@/hooks/useMessages'
import type { PaymentStatusState } from '@/hooks/usePaymentStatus'
import type { PaymentIntentStatus } from '@/types/Stripe'
import checkmarkAnim from '@/assets/animations/checkmark.json'
import clockAnim from '@/assets/animations/clock_loop.json'
import exclamationAnim from '@/assets/animations/exclamation.json'

export const successStatuses: PaymentIntentStatus[] = [
  'succeeded',
  'requires_capture',
]

const warningStatuses: PaymentIntentStatus[] = [
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
  'canceled',
]

const getStripeStatusLine = (
  status: PaymentStatusState,
  statusText: CheckoutStatusText,
): string => {
  if (!status.messageOverride) {
    return statusText.intent(status.intent)
  }

  switch (status.messageOverride.type) {
    case 'retry':
      return statusText.retry(
        status.messageOverride.attempt,
        status.messageOverride.maxRetries,
      )

    case 'failure':
      return statusText.fetchFailed(status.messageOverride.details)

    case 'timeout':
      return statusText.timeout(status.messageOverride.timeoutSeconds)
  }
}

type PaymentStatusViewArgs = {
  status: PaymentStatusState
  statusText: CheckoutStatusText
}

type PaymentStatusView = {
  animation: object
  isLooping: boolean
  primaryLine: string
  secondaryLine: string | null
}

export const getPaymentStatusView = ({
  status,
  statusText,
}: PaymentStatusViewArgs): PaymentStatusView => {
  const isStripeSuccess = successStatuses.includes(status.intent)
  const isWarning = warningStatuses.includes(status.intent)
  const statusLine = getStripeStatusLine(status, statusText)

  if (isStripeSuccess) {
    return {
      animation: checkmarkAnim,
      isLooping: false,
      primaryLine: statusText.paymentReceived,
      secondaryLine: null,
    }
  }

  return {
    animation: isWarning ? exclamationAnim : clockAnim,
    isLooping: !isWarning,
    primaryLine: statusLine,
    secondaryLine: null,
  }
}
