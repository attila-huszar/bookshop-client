import type { Book } from './Book'

export type Cart = Pick<
  Book,
  'id' | 'title' | 'price' | 'discount' | 'discountPrice' | 'imgUrl'
> & {
  quantity: number
}

/** Basket intent shared by Redux, browser storage, and checkout requests. */
export type CartItem = Pick<Cart, 'id' | 'quantity'>
