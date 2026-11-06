import { useTranslation } from 'react-i18next'
import {
  applyBooksFilters,
  setBooksFilterDiscount,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} from '@/store/slices/books'
import { Button } from '@/components/Button'
import { useAppDispatch } from '@/hooks/redux'
import { FilterCircleXmarkIcon } from '@/assets/svg'
import { StyledEmptyFilterResults } from './EmptyFilterResults.style'

export function EmptyFilterResults() {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()

  const handleFormReset = () => {
    dispatch(applyBooksFilters())
    dispatch(setBooksFilterGenre([]))
    dispatch(setBooksFilterPrice([]))
    dispatch(setBooksFilterDiscount('allBooks'))
    dispatch(setBooksFilterPublishYear([]))
    dispatch(setBooksFilterRating(0.5))
  }

  return (
    <StyledEmptyFilterResults>
      <div role="img" aria-label={t('filters.noResults')}>
        <FilterCircleXmarkIcon color="var(--color-on-surface-variant)" />
      </div>
      <p>{t('filters.empty')}</p>
      <p>{t('filters.adjust')}</p>
      <Button onClick={handleFormReset} $shadow>
        {t('filters.reset')}
      </Button>
    </StyledEmptyFilterResults>
  )
}
