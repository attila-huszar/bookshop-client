import { OrderSyncIssueCode } from '@/types/Order'

export class OrderSyncStatusError extends Error {
  code: OrderSyncIssueCode

  constructor(code: OrderSyncIssueCode, message: string) {
    super(message)
    this.name = 'OrderSyncStatusError'
    this.code = code
  }
}
