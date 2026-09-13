import type { CheckoutStatusText } from '@/hooks/useMessages'
import type { PaymentStatusState } from '@/hooks/usePaymentStatus'
import type { PaymentIntentStatus } from '@/types/Stripe'
import checkmarkAnim from '@/assets/animations/checkmark.json'
import clockAnim from '@/assets/animations/clock_loop.json'
import exclamationAnim from '@/assets/animations/exclamation.json'

export const successStatuses = [
  'succeeded',
  'requires_capture',
] as const satisfies readonly PaymentIntentStatus[]

type SuccessPaymentIntentStatus = (typeof successStatuses)[number]

export const isSuccessPaymentIntentStatus = (
  status: PaymentIntentStatus,
): status is SuccessPaymentIntentStatus =>
  successStatuses.some((successStatus) => successStatus === status)

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
    if (isSuccessPaymentIntentStatus(status.intent)) {
      return statusText.paymentReceived
    }

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
}

export const getPaymentStatusView = ({
  status,
  statusText,
}: PaymentStatusViewArgs): PaymentStatusView => {
  if (isSuccessPaymentIntentStatus(status.intent)) {
    return {
      animation: checkmarkAnim,
      isLooping: false,
      primaryLine: statusText.paymentReceived,
    }
  }

  const isWarning = warningStatuses.includes(status.intent)
  const statusLine = getStripeStatusLine(status, statusText)

  return {
    animation: isWarning ? exclamationAnim : clockAnim,
    isLooping: !isWarning,
    primaryLine: statusLine,
  }
}
