import { useTranslation } from 'react-i18next'
import { shopLanguage } from '@/i18n'
import { formatAmount } from '@/helpers/pricing'

export function useLanguage() {
  const { t, i18n } = useTranslation()
  const language = shopLanguage(i18n.resolvedLanguage)

  return {
    t,
    language,
    formatAmount: (amount: number) => formatAmount(amount, language),
  }
}
