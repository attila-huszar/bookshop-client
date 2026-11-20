import type { ParseKeys } from 'i18next'

export const ROUTE = {
  HOME: '/',
  BOOKS: 'books',
  BOOK: 'book',
  LOGIN: 'login',
  REGISTER: 'register',
  ACCOUNT: 'account',
  ORDERS: 'orders',
  CART: 'cart',
  CHECKOUT: 'checkout',
  TERMS: 'terms',
  VERIFICATION: 'verification',
  PASSWORD_RESET: 'password-reset',
  CMS: 'cms',
} as const

export function pageTitle(titleKey: ParseKeys, count?: number) {
  return { titleKey, count }
}

export function parseBookId(rawId: string | null) {
  if (!rawId || !/^\d+$/.test(rawId)) {
    return null
  }

  const id = Number(rawId)

  return Number.isSafeInteger(id) && id > 0 ? id : null
}
