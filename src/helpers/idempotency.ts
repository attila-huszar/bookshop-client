import { paymentIdempotencyKey } from '@/constants/keys'
import type { PaymentIntentRequest } from '@/types'
import { localStorageAdapter } from './browserStorage'

type StoredPaymentIdempotency = {
  fingerprint: string
  clientIdempotencyKey: string
}

/** Reuse the persisted key for identical retries; changed requests start a new attempt. */
export function getClientIdempotencyKey(payment: PaymentIntentRequest): string {
  const fingerprint = JSON.stringify(payment)
  const stored = localStorageAdapter.get<StoredPaymentIdempotency>(
    paymentIdempotencyKey,
  )

  if (stored?.fingerprint === fingerprint && stored.clientIdempotencyKey) {
    return stored.clientIdempotencyKey
  }

  const clientIdempotencyKey = crypto.randomUUID()
  localStorageAdapter.set(paymentIdempotencyKey, {
    fingerprint,
    clientIdempotencyKey,
  })

  return clientIdempotencyKey
}

export function isCurrentClientIdempotencyKey(key: string): boolean {
  return (
    localStorageAdapter.get<StoredPaymentIdempotency>(paymentIdempotencyKey)
      ?.clientIdempotencyKey === key
  )
}

/** Clear only the expected key, preserving a newer attempt's persisted key. */
export function clearClientIdempotencyKey(clientIdempotencyKey: string): void {
  if (isCurrentClientIdempotencyKey(clientIdempotencyKey)) {
    resetClientIdempotencyKey()
  }
}

/** Forget the attempt when checkout is explicitly reset or canceled. */
export function resetClientIdempotencyKey(): void {
  localStorageAdapter.remove(paymentIdempotencyKey)
}
