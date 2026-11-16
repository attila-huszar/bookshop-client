import { styled } from 'styled-components'
import {
  dropdownListStyles,
  dropdownOptionStyles,
  dropdownSurfaceStyles,
} from '@/styles/dropdown.styles'
import { baseInputStyles, FormTypes } from '@/styles/form.styles'

export const SelectedOption = styled.div<FormTypes>`
  ${baseInputStyles}
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 3rem;
  cursor: pointer;

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
    color: var(--color-on-surface-variant);
    flex-shrink: 0;
  }
`

export const DropdownList = styled.div`
  ${dropdownSurfaceStyles}
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  z-index: 10;
`

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-bottom: 1px solid var(--color-outline-variant);
  outline: none;
  font-size: 1rem;

  &:focus {
    background-color: var(--color-surface-container-low);
  }
`

export const OptionsList = styled.ul`
  ${dropdownListStyles}
  max-height: 200px;
  overflow-y: auto;
`

export const OptionItem = styled.li`
  ${dropdownOptionStyles}
  display: flex;
  align-items: center;
  gap: 10px;

  &[aria-selected='true'] span {
    font-weight: inherit;
  }
`

export const CountryFlag = styled.img`
  width: 24px;
  height: 18px;
  object-fit: cover;
  border: 1px solid var(--color-outline-variant);
  border-radius: 2px;
  flex-shrink: 0;
`

export const CountryName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
