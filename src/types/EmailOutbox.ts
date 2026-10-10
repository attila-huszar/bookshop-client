export const emailOutboxStatuses = [
  'pending',
  'scheduled',
  'publishing',
  'processed',
  'queued',
  'sending',
  'retrying',
  'sent',
  'skipped',
  'failed',
] as const

export const orderEmailTypes = [
  'orderConfirmation',
  'adminPaymentNotification',
] as const

export type EmailOutboxStatus = (typeof emailOutboxStatuses)[number]
export type OrderEmailType = (typeof orderEmailTypes)[number]

export type EmailOutboxQuery = {
  paymentId: string
  page: number
  limit: number
  status?: EmailOutboxStatus
  type?: OrderEmailType
  search?: string
}

/** Admin summary only; email bodies and account links are never returned. */
export type EmailOutboxEntry = {
  id: string
  type: OrderEmailType
  recipient: string
  notificationType: 'new' | 'error' | null
  failureReason: string | null
  paymentId: string | null
  status: EmailOutboxStatus
  queueAttempts: number
  deliveryAttempts: number
  createdAt: string
  processedAt: string | null
  deliveryUpdatedAt: string | null
  nextAttemptAt: string | null
  lastError: string | null
}

export type EmailOutboxResponse = {
  entries: EmailOutboxEntry[]
  total: number
  page: number
  limit: number
}
