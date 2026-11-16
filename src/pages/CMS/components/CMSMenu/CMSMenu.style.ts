import { styled } from 'styled-components'
import {
  MenuItem,
  MenuList,
  StyledMenu,
} from '@/components/Header/components/Menu/Menu.style'
import { StyledMenuDropdown } from '@/components/Header/components/MenuDropdown/MenuDropdown.styles'

export const StyledCMSMenu = styled(StyledMenu)`
  margin-left: auto;
  flex-shrink: 0;

  ${StyledMenuDropdown} {
    top: calc(100% + 0.5rem);
    left: auto;
    right: 0;
    width: min(18rem, calc(100vw - 4rem));
  }
`

export const ActionList = styled(MenuList)`
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
