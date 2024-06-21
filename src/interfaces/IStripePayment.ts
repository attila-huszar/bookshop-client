export interface IStripePayment {
  items: number[]
  currency?: string
  receipt_email: string
  description: string
  shipping: Shipping
}

interface Shipping {
  address: Address
  name: string
  phone: string
}

interface Address {
  city: string
  country: string
  line1: string
  line2: string
  postal_code: string
  state: string
}
