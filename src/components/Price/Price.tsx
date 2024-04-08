import {
  StyledPriceCard,
  StyledPriceProduct,
  Currency,
  Strikethrough,
} from './Price.styles'
import { PriceProps } from '../../interfaces'

export function Price({
  component,
  price,
  discount,
  currency = '$',
}: PriceProps) {
  const Component = component === 'card' ? StyledPriceCard : StyledPriceProduct

  return (
    <Component>
      {discount ? (
        <>
          <Currency>{currency}</Currency>
          <span>
            {(Number(price) - (Number(price) * discount) / 100).toFixed(2)}
          </span>
          <Strikethrough>
            <Currency>{currency}</Currency>
            <span>{price}</span>
          </Strikethrough>
        </>
      ) : (
        <>
          <Currency>{currency}</Currency>
          <span>{price}</span>
        </>
      )}
    </Component>
  )
}
