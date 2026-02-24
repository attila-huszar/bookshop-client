import type { LottieOptions } from 'lottie-react'
import type { CheckoutStatusText } from '@/hooks/useMessages'
import type { PaymentStatusState } from '@/hooks/usePaymentStatus'
import type { OrderSyncIssueCode } from '@/types/Order'
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

export const getEffectiveStatusLine = (
  syncedPaymentStatus: PaymentIntentStatus | null,
  status: PaymentStatusState,
  statusText: CheckoutStatusText,
): string => {
  if (syncedPaymentStatus) {
    return statusText.intent(syncedPaymentStatus)
  }

  return getStripeStatusLine(status, statusText)
}

type StatusViewArgs = {
  isOrderConfirmed: boolean
  orderSyncIssueCode: OrderSyncIssueCode | null
  syncedPaymentStatus: PaymentIntentStatus | null
  intent: PaymentIntentStatus
  statusLine: string
  statusText: CheckoutStatusText
  statusDetail: string
}

export const getStatusView = ({
  isOrderConfirmed,
  orderSyncIssueCode,
  syncedPaymentStatus,
  intent,
  statusLine,
  statusText,
  statusDetail,
}: StatusViewArgs) => {
  const isStripeSuccess = successStatuses.includes(intent)
  const hasHardSyncError =
    orderSyncIssueCode !== null && orderSyncIssueCode !== 'timeout'
  const isWarning = warningStatuses.includes(intent)

  if (isOrderConfirmed) {
    return {
      animation: checkmarkAnim,
      isLooping: false,
      headline: statusText.orderConfirmed,
      detail: null,
    }
  }

  if (isStripeSuccess) {
    let animation: LottieOptions['animationData'] = clockAnim
    let isLooping = true
    let headline = statusText.paymentReceived

    if (hasHardSyncError) {
      animation = exclamationAnim
      isLooping = false
    }

    if (syncedPaymentStatus === 'canceled') {
      animation = exclamationAnim
      isLooping = false
      headline = statusText.paymentCanceled
    } else if (
      syncedPaymentStatus &&
      !successStatuses.includes(syncedPaymentStatus)
    ) {
      animation = exclamationAnim
      isLooping = false
      headline = statusLine
    } else if (orderSyncIssueCode === 'unauthorized') {
      headline = statusText.verificationIssue
    }

    return {
      animation,
      isLooping,
      headline,
      detail: statusDetail,
    }
  }

  return {
    animation: isWarning ? exclamationAnim : clockAnim,
    isLooping: !isWarning,
    headline: statusLine,
    detail: null,
  }
}
