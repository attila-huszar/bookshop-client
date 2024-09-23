export interface IPriceProps {
  component: 'card' | 'product' | 'cart'
  price: number
  discount: number
  currency?: string
}
