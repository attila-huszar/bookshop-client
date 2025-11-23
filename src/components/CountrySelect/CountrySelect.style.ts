import styled from 'styled-components'
import { baseInputStyles, FormTypes } from '@/styles'

interface OptionItemProps {
  $selected?: boolean
}

export const SelectedOption = styled.div<FormTypes>`
  ${baseInputStyles}
  display: flex;
  align-items: center;
  gap: 0.5rem;

  & > div {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
  }

  & > svg {
    height: 1rem;
    margin-left: auto;
    margin-right: 0.5rem;
    color: var(--grey);
    flex-shrink: 0;
  }
`

export const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid lightgrey;
  border-radius: 5px;
  margin-top: 4px;
  padding: 0;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  outline: none;
  font-size: 1rem;

  &:focus {
    background-color: #f9f9f9;
  }
`

export const OptionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
`

export const OptionItem = styled.li<OptionItemProps>`
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${({ $selected }) =>
    $selected ? '#e6f7ff' : 'transparent'};
  font-weight: ${({ $selected }) => ($selected ? '600' : 'normal')};

  &:hover {
    background-color: ${({ $selected }) => ($selected ? '#e6f7ff' : '#f5f5f5')};
  }
`

export const CountryFlag = styled.img`
  width: 24px;
  height: 18px;
  object-fit: cover;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  flex-shrink: 0;
`

export const CountryName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
