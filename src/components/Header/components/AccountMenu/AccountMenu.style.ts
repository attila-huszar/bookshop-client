import { styled } from 'styled-components'
import { StyledButton } from '@/components/Button/Button.style'
import { MenuItem, MenuList, StyledMenu } from '../Menu/Menu.style'
import { StyledMenuDropdown } from '../MenuDropdown/MenuDropdown.styles'

export const GuestActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--header-action-gap, 1.25rem);

  > ${StyledButton} {
    padding-inline: 0.5rem;
    min-inline-size: max-content;
  }
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
