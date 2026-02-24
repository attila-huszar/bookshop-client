import { defaultLocale } from '@/constants'
import { Order } from '@/types'

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '✖️'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString(defaultLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

export const getPaidAtStatus = ({ paidAt, paymentStatus }: Order) => {
  if (paidAt) return formatDate(paidAt)
  return paymentStatus === 'succeeded' ? '✏️' : '✖️'
}
