import { defaultCurrencySymbol } from '@/constants'
import {
  Currency,
  Strikethrough,
  StyledPriceCard,
  StyledPriceCart,
  StyledPriceProduct,
} from './Price.style'

type Props = {
  component: 'card' | 'product' | 'cart'
  price: number
  discount: number
  currency?: string
}

export function Price({
  component,
  price,
  discount,
  currency = defaultCurrencySymbol,
}: Props) {
  const componentMap = {
    card: StyledPriceCard,
    product: StyledPriceProduct,
    cart: StyledPriceCart,
  }

  const Component = componentMap[component]

  const discountPrice = price - (price * discount) / 100
  const formattedPrice = Number.isInteger(discountPrice)
    ? discountPrice
    : discountPrice.toFixed(2)

  return (
    <Component>
      {discount ? (
        <p>
          <span>
            <Currency>{currency}</Currency>
            <span>{formattedPrice}</span>
          </span>
          <Strikethrough>
            <Currency>{currency}</Currency>
            <span>{price}</span>
          </Strikethrough>
        </p>
      ) : (
        <p>
          <span>
            <Currency>{currency}</Currency>
            <span>{price}</span>
          </span>
        </p>
      )}
    </Component>
  )
}
