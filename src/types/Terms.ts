import type { ShopLanguage } from '@/i18n'
import type { Order } from './Order'

export type TermsDocument = {
  version: string
  content: Record<ShopLanguage, string>
  publishedAt: string
}

export type PublishTermsRequest = Pick<TermsDocument, 'content'>

export type TermsDocumentSummary = Pick<
  TermsDocument,
  'version' | 'publishedAt'
> & { canDelete: boolean }

export type CheckoutTerms = Pick<TermsDocument, 'version' | 'publishedAt'> & {
  url: string
}

export type TermsAcceptance = Pick<TermsDocument, 'version'> & {
  language: ShopLanguage
  acceptedAt: string
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
