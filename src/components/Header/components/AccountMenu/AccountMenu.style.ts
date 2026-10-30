import { styled } from 'styled-components'
import { MenuItem, MenuList, StyledMenu } from '../Menu/Menu.style'
import { StyledMenuDropdown } from '../MenuDropdown/MenuDropdown.styles'

export const GuestActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--header-action-gap, 1.25rem);
`

export const StyledAccountMenu = styled(StyledMenu)`
  ${StyledMenuDropdown} {
    width: 14rem;
    max-width: calc(100vw - 3rem);
    left: auto;
    right: 0;
  }
`

export const AccountMenuList = styled(MenuList)`
  ${MenuItem} {
    > svg {
      flex-shrink: 0;
    }

    > span {
      white-space: normal;
      overflow-wrap: anywhere;
    }
  }
`
