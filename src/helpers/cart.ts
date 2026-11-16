import { storedCartSchema } from '@/validation/orderSchemas'
import { cartKey } from '@/constants/keys'
import type { CartItem } from '@/types'
import { localStorageAdapter } from './browserStorage'

/** Restore the saved basket, or start empty if any stored item is invalid. */
export function readStoredCart(): CartItem[] {
  try {
    return storedCartSchema.validateSync(
      localStorageAdapter.get<unknown>(cartKey),
    )
  } catch {
    return []
  }
}

export const areCartItemsEqual = (
  first: readonly CartItem[],
  second: readonly CartItem[],
): boolean =>
  first.length === second.length &&
  first.every(
    (item, index) =>
      item.id === second[index]?.id &&
      item.quantity === second[index]?.quantity,
  )
