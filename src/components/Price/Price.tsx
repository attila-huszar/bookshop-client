import {
  StyledPriceCard,
  StyledPriceProduct,
  StyledPriceCart,
  Currency,
  Strikethrough,
} from './Price.styles'
import { IPriceProps } from '../../interfaces'

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

  return (
    <Component>
      {discount ? (
        <p>
          <span>
            <Currency>{currency}</Currency>
            <span>
              {(Number(price) - (Number(price) * discount) / 100).toFixed(2)}
            </span>
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
