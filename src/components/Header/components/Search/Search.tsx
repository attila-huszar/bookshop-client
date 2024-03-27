import styled from 'styled-components'
import searchIcon from '../../../../assets/svg/search.svg'

const StyledLabel = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  margin-right: auto;

  &:before {
    content: '';
    position: absolute;
    left: 12px;
    height: 20px;
    width: 20px;
    background: url(${searchIcon}) center no-repeat;
  }
`

const StyledSearch = styled.input`
  height: 36px;
  padding: 0 12px 0 40px;
  background-color: #eaeaea;
  border: none;
  border-radius: 10px;
`

export function Search() {
  return (
    <StyledLabel>
      <StyledSearch type="text" placeholder="What are you looking for?" />
    </StyledLabel>
  )
}
