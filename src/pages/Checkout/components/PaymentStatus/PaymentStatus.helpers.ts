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

const getStatusLine = (
  syncedPaymentStatus: PaymentIntentStatus | null,
  status: PaymentStatusState,
  statusText: CheckoutStatusText,
): string => {
  if (syncedPaymentStatus) {
    return statusText.intent(syncedPaymentStatus)
  }

  return getStripeStatusLine(status, statusText)
}

type PaymentStatusViewArgs = {
  status: PaymentStatusState
  orderSyncIssueCode: OrderSyncIssueCode | null
  syncedPaymentStatus: PaymentIntentStatus | null
  orderSyncAttempt: number
  statusText: CheckoutStatusText
}

const toOptionalLine = (line: string): string | null => {
  if (!line.trim()) return null
  return line
}

export const getPaymentStatusView = ({
  status,
  orderSyncIssueCode,
  syncedPaymentStatus,
  orderSyncAttempt,
  statusText,
}: PaymentStatusViewArgs) => {
  const isStripeSuccess = successStatuses.includes(status.intent)
  const hasHardSyncError =
    orderSyncIssueCode !== null && orderSyncIssueCode !== 'timeout'
  const isWarning = warningStatuses.includes(status.intent)
  const isOrderConfirmed = Boolean(
    syncedPaymentStatus && successStatuses.includes(syncedPaymentStatus),
  )
  const statusLine = getStatusLine(syncedPaymentStatus, status, statusText)

  if (isOrderConfirmed) {
    return {
      animation: checkmarkAnim,
      isLooping: false,
      primaryLine: statusText.orderConfirmed,
      secondaryLine: null,
    }
  }

  if (isStripeSuccess) {
    let animation: LottieOptions['animationData'] = clockAnim
    let isLooping = true
    let primaryLine = statusText.paymentReceived

    if (hasHardSyncError) {
      animation = exclamationAnim
      isLooping = false
    }

    if (syncedPaymentStatus === 'canceled') {
      animation = exclamationAnim
      isLooping = false
      primaryLine = statusText.paymentCanceled
    } else if (
      syncedPaymentStatus &&
      !successStatuses.includes(syncedPaymentStatus)
    ) {
      animation = exclamationAnim
      isLooping = false
      primaryLine = statusLine
    } else if (orderSyncIssueCode === 'unauthorized') {
      primaryLine = statusText.verificationIssue
    }

    const secondaryLine =
      syncedPaymentStatus && !successStatuses.includes(syncedPaymentStatus)
        ? null
        : toOptionalLine(
            statusText.detail(
              orderSyncIssueCode,
              syncedPaymentStatus,
              orderSyncAttempt,
            ),
          )

    return {
      animation,
      isLooping,
      primaryLine,
      secondaryLine: secondaryLine === primaryLine ? null : secondaryLine,
    }
  }

  return {
    animation: isWarning ? exclamationAnim : clockAnim,
    isLooping: !isWarning,
    primaryLine: statusLine,
    secondaryLine: null,
  }
}
