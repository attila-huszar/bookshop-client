import { styled } from 'styled-components'
import { SearchTypes } from './Search.types'

export const StyledForm = styled.div`
  flex-shrink: 1;
  margin-right: auto;

  form {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }
`

export const SearchField = styled.input`
  height: 36px;
  width: 100%;
  padding: 0 40px;
  border: none;
  border-radius: 10px;
  outline: none;
  background-color: var(--light-grey);

  &::-webkit-input-placeholder {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &::placeholder {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

export const Dropdown = styled.div<SearchTypes>`
  position: absolute;
  top: 1.75rem;
  left: 0;
  display: none;
  width: 100%;
  padding: 0.125rem 0.5rem 0.5rem;
  border-radius: 0 0 10px 10px;
  background-color: var(--light-grey);

  ${({ $show }) => $show && 'display: block;'}
`

export const SearchButton = styled.button`
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  height: 1rem;
  width: 1rem;
  padding: 0;
  background-color: transparent;
  border: none;
  outline: inherit;
  cursor: pointer;
`

export const ClearButton = styled.button`
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  height: 1rem;
  width: 1rem;
  padding: 0;
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
`

export const DropdownList = styled.ul`
  max-height: 14rem;
  margin-top: 6px;
  padding: 0;
  font-size: 0.775rem;
  list-style: none;
  background-color: var(--white);
  border-radius: var(--border-radius);
  z-index: 10;
  overflow-y: auto;

  li:hover {
    background-color: var(--secondary-hover);
  }

  li:first-child {
    border-radius: var(--border-radius) var(--border-radius) 0 0;
  }

  li:last-child {
    border-radius: 0 0 var(--border-radius) var(--border-radius);
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

export const TextBold = styled.p`
  font-weight: 700;
  text-wrap: balance;
`

export const NoResults = styled.li`
  display: flex;
  align-items: center;
  height: 3.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: var(--light-black);
`
