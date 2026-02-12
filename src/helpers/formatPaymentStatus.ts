import type { PaymentIntentStatus } from '@/types'

const statusEmojiMap: Record<PaymentIntentStatus, string> = {
  succeeded: '✅',
  processing: '⏳',
  requires_payment_method: '💳',
  requires_confirmation: '⚠️',
  requires_action: '❗',
  canceled: '❌',
  requires_capture: '🔒',
}

export const formatPaymentStatus = (
  status: PaymentIntentStatus | undefined,
): string => {
  const emoji = status ? statusEmojiMap[status] : '❓'
  const formattedStatus = status
    ? status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Unknown'

  return `${emoji} ${formattedStatus}`
}
