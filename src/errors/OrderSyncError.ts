import { OrderSyncIssueCode } from '@/types/Order'

export class OrderSyncError extends Error {
  code: OrderSyncIssueCode

  constructor(code: OrderSyncIssueCode, message: string) {
    super(message)
    this.name = 'OrderSyncError'
    this.code = code
  }
}
