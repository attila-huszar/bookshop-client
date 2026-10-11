import {
  applyBooksFilters,
  setBooksFilterDiscount,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} from '@/store'
import { Button } from '@/components'
import { useAppDispatch } from '@/hooks'
import { FilterCircleXmarkIcon } from '@/assets/svg'
import { StyledEmptyFilterResults } from './EmptyFilterResults.style'

export function EmptyFilterResults() {
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
      <div role="img" aria-label="no results">
        <FilterCircleXmarkIcon color="var(--color-on-surface-variant)" />
      </div>
      <p>Sorry, no results match your filter criteria.</p>
      <p>Please try adjusting your filters or searching again.</p>
      <Button onClick={handleFormReset} $shadow>
        Reset Filters
      </Button>
    </StyledEmptyFilterResults>
  )
}
