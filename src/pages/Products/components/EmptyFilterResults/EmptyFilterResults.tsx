import {
  fetchBooks,
  setBooksFilterDiscount,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} from '@/store'
import { Button } from '@/components'
import { useAppDispatch } from '@/hooks'
import { EmptyFilterResultIcon } from '@/assets/svg'
import { StyledEmptyFilterResults } from './EmptyFilterResults.style'

export function EmptyFilterResults() {
  const dispatch = useAppDispatch()

  const handleFormReset = () => {
    void dispatch(fetchBooks())
    dispatch(setBooksFilterGenre([]))
    dispatch(setBooksFilterPrice([]))
    dispatch(setBooksFilterDiscount('allBooks'))
    dispatch(setBooksFilterPublishYear([]))
    dispatch(setBooksFilterRating(0.5))
  }

  return (
    <StyledEmptyFilterResults>
      <div role="img" aria-label="no results">
        <EmptyFilterResultIcon color="var(--grey)" />
      </div>
      <p>Sorry, no results match your filter criteria.</p>
      <p>Please try adjusting your filters or searching again.</p>
      <Button onClick={handleFormReset} $shadow>
        Reset Filters
      </Button>
    </StyledEmptyFilterResults>
  )
}
