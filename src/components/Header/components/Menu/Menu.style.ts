import { styled } from 'styled-components'
import {
  dropdownListStyles,
  dropdownOptionStyles,
} from '@/styles/dropdown.styles'
import { media } from '@/styles/media.breakpoints'

export const StyledMenu = styled.div`
  position: relative;
`

export const MenuList = styled.ul`
  ${dropdownListStyles}
  min-height: 0;
  overflow: hidden;

  ${media.down('sm')`
    height: 100%;
    padding-top: 4rem;
    background-color: var(--color-surface-container-lowest);
  `}

  & a {
    display: block;
    cursor: pointer;
  }
`

export const MenuItem = styled.div`
  ${dropdownOptionStyles}
  display: flex;
  align-items: center;
  gap: 1rem;

  &:is(button) {
    width: 100%;
    border: 0;
    font: inherit;
    text-align: left;
    cursor: pointer;

    &:disabled {
      opacity: 0.6;
      cursor: wait;
    }
  }

  > svg {
    height: 1.5rem;
    width: 1.5rem;
  }

  > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
