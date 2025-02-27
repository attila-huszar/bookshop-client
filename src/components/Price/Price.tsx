import {
  StyledPriceCard,
  StyledPriceProduct,
  StyledPriceCart,
  Currency,
  Strikethrough,
} from './Price.style'
import { IPriceProps } from '@/interfaces'

export function Price({
  component,
  price,
  discount,
  currency = '$',
}: IPriceProps) {
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
