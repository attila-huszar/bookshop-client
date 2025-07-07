import { StyledEmptyFilterResults } from './EmptyFilterResults.style'
import { useAppDispatch } from '@/hooks'
import {
  fetchBooks,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterDiscount,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} from '@/store'
import { Button } from '@/components'
import { EmptyFilterResultIcon } from '@/assets/svg'

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
