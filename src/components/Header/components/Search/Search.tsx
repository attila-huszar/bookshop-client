import { StyledLabel, StyledSearch } from './Search.styles'

export function Search() {
  return (
    <StyledLabel>
      <StyledSearch type="text" placeholder="What are you looking for?" />
    </StyledLabel>
  )
}
