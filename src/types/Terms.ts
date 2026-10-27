import type { ShopLanguage } from '@/i18n'
import type { Order } from './Order'

export type TermsDocument = {
  version: string
  content: Record<ShopLanguage, string>
  statements: Record<ShopLanguage, string>
  publishedAt: string
}

export type PublishTermsRequest = Pick<TermsDocument, 'content'>

export type TermsDocumentSummary = Pick<
  TermsDocument,
  'version' | 'publishedAt'
> & { canDelete: boolean }

export type CheckoutTerms = Pick<
  TermsDocument,
  'version' | 'statements' | 'publishedAt'
> & {
  url: string
}

export type TermsAcceptance = Pick<TermsDocument, 'version'> & {
  language: ShopLanguage
  acceptedAt: string
  statement: string
}

export type PaymentTermsReview = {
  terms: CheckoutTerms | null
  order: Pick<Order, 'items' | 'total' | 'currency'>
}

export type AcceptPaymentTermsRequest = Pick<
  TermsAcceptance,
  'version' | 'language'
> & {
  paymentId: string
  accepted: true
}
