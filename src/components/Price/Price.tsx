import { useTranslation } from 'react-i18next'
import { formatAmount } from '@/helpers/checkout'
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

export function Price({
  component,
  price,
  discount,
  quantity = 1,
  currency = defaultCurrencySymbol,
}: Props) {
  const { i18n } = useTranslation()
  const formatPrice = (amount: number) =>
    formatAmount(
      amount,
      i18n.resolvedLanguage,
      Number.isInteger(amount) ? 0 : 2,
    )

  const componentMap = {
    card: StyledPriceCard,
    product: StyledPriceProduct,
    cart: StyledPriceCart,
  }

  const Component = componentMap[component]

  const originalPrice = calculatePriceCents(price, 0, quantity) / 100
  const discountPrice = calculatePriceCents(price, discount, quantity) / 100
  const formattedPrice = formatPrice(discountPrice)

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
            <span>{formatPrice(originalPrice)}</span>
          </Strikethrough>
        </p>
      ) : (
        <p>
          <span>
            <Currency>{currency}</Currency>
            <span>{formatPrice(originalPrice)}</span>
          </span>
        </p>
      )}
    </Component>
  )
}
