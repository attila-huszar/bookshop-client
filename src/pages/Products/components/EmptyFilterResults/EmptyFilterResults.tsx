import { Button } from '../../../../components'
import { useAppDispatch } from '../../../../hooks'
import {
  fetchAllBooks,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterDiscount,
  setBooksFilterPublishYear,
} from '../../../../store'
import { StyledEmptyFilterResults } from './EmptyFilterResults.styles'
import NoResultsIcon from '../../../../assets/svg/nofilter.svg?react'

export function EmptyFilterResults() {
  const dispatch = useAppDispatch()

  const handleFormReset = () => {
    dispatch(fetchAllBooks())
    dispatch(setBooksFilterGenre([]))
    dispatch(setBooksFilterPrice([]))
    dispatch(setBooksFilterDiscount('allBooks'))
    dispatch(setBooksFilterPublishYear([]))
  }

  return (
    <StyledEmptyFilterResults>
      <div>
        <NoResultsIcon color="var(--grey)" />
      </div>
      <p>Sorry, no results match your filter criteria.</p>
      <p>Please try adjusting your filters or searching again.</p>
      <Button onClick={handleFormReset} $shadowed>
        Reset Filters
      </Button>
    </StyledEmptyFilterResults>
  )
}
