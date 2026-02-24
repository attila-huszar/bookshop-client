import { OrderSyncIssueCode } from '@/types'

export const orderSyncIssueCodes: OrderSyncIssueCode[] = [
  'timeout',
  'retryable',
  'unauthorized',
  'unknown',
]

export const isOrderSyncIssueCode = (
  code: string | undefined,
): code is OrderSyncIssueCode =>
  typeof code === 'string' &&
  orderSyncIssueCodes.includes(code as OrderSyncIssueCode)
