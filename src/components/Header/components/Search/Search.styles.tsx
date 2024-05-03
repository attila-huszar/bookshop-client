import styled from 'styled-components'
import searchIcon from '../../../../assets/svg/search.svg'
import clearIcon from '../../../../assets/svg/cancel-circle-stroke-rounded.svg'
import { SearchTypes } from './Search.types'

export const StyledForm = styled.div`
  display: flex;
  align-items: center;
  margin-right: auto;

  form {
    position: relative;
  }
`

export const SearchField = styled.input`
  height: 36px;
  width: 20rem;
  padding: 0 12px 0 40px;
  border: none;
  border-radius: 10px;
  outline: none;
  background-color: var(--light-grey);
`

export const Dropdown = styled.div<SearchTypes>`
  position: absolute;
  top: 1.75rem;
  left: 0;
  display: none;
  width: 20rem;
  padding: 0.5rem;
  border-radius: 0 0 10px 10px;
  background-color: var(--light-grey);

  ${({ $show }) => $show && 'display: block;'}
`

export const SearchButton = styled.button`
  position: absolute;
  top: 8px;
  left: 12px;
  height: 20px;
  width: 20px;
  padding: 0;
  color: inherit;
  border: none;
  outline: inherit;
  cursor: pointer;
  background: url(${searchIcon}) center no-repeat;
`

export const ClearButton = styled.button`
  position: absolute;
  top: 8px;
  right: 12px;
  height: 20px;
  width: 20px;
  padding: 0;
  border: none;
  outline: none;
  cursor: pointer;
  background-color: transparent;
  background-image: url(${clearIcon});
  background-position: center;
  background-repeat: no-repeat;
  background-size: 20px;

  &:hover {
    background-color: transparent;
  }
`

export const DropdownList = styled.ul`
  max-height: 14rem;
  margin-top: 6px;
  padding: 0;
  font-size: 0.875rem;
  list-style: none;
  background-color: var(--white);
  border-radius: 5px;

  z-index: 10;
  overflow-y: auto;

  li:hover {
    background-color: var(--primary-faded);
  }

  li:first-child {
    border-radius: 5px 5px 0 0;
  }

  li:last-child {
    border-radius: 0 0 5px 5px;
  }

  & a {
    display: block;
  }
`

export const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  height: 3.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;

  img {
    height: auto;
  }

  svg {
    margin-left: auto;
    color: var(--grey);
  }
`

export const ErrorItem = styled.div`
  display: flex;
  align-items: center;
  height: 3.5rem;
  padding: 0.5rem 1rem;
`
