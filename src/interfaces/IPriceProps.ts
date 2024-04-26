export interface IPriceProps {
  component: 'card' | 'product' | 'cart'
  price: number | string
  discount?: number
  currency?: string
}
