import { useLanguage } from '@/hooks/useLanguage'
import { calculatePriceCents } from '@/helpers/pricing'
import { defaultCurrencySymbol } from '@/constants/defaultValues'
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
  quantity?: number
  currency?: string
}

const componentMap = {
  card: StyledPriceCard,
  product: StyledPriceProduct,
  cart: StyledPriceCart,
}

export function Price({
  component,
  price,
  discount,
  quantity = 1,
  currency = defaultCurrencySymbol,
}: Props) {
  const { formatAmount } = useLanguage()

  const Component = componentMap[component]

  const originalPrice = calculatePriceCents(price, 0, quantity) / 100
  const discountPrice = calculatePriceCents(price, discount, quantity) / 100

  return (
    <Component>
      <p>
        <span>
          <Currency>{currency}</Currency>
          <span>{formatAmount(discountPrice)}</span>
        </span>
        {discount ? (
          <Strikethrough>
            <Currency>{currency}</Currency>
            <span>{formatAmount(originalPrice)}</span>
          </Strikethrough>
        ) : null}
      </p>
    </Component>
  )
}
