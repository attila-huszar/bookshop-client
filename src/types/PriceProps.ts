export type PriceProps = {
  component: 'card' | 'product' | 'cart'
  price: number
  discount: number
  currency?: string
}
