import { Book } from './Book'

export type Cart = Pick<
  Book,
  'id' | 'title' | 'price' | 'discount' | 'discountPrice' | 'imgUrl'
> & {
  quantity: number
}

export type MinimalCart = Pick<Cart, 'id' | 'quantity'>
