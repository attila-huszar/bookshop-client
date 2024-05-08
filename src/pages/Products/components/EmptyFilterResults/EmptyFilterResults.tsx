import { StyledEmptyFilterResults } from './EmptyFilterResults.styles'

export function EmptyFilterResults() {
  return (
    <StyledEmptyFilterResults>
      <div>
        <p>
          Sorry, no results match your filter criteria. Please try adjusting
          your filters or searching again.
        </p>
      </div>
    </StyledEmptyFilterResults>
  )
}
