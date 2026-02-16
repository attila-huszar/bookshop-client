import { FC, ReactNode, RefObject } from 'react'
import { StyledMenuDropdown } from './MenuDropdown.styles'

type Props = {
  show: boolean
  dropdownRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}

export const MenuDropdown: FC<Props> = ({ show, children, dropdownRef }) => {
  return (
    <StyledMenuDropdown $show={show} ref={dropdownRef}>
      {children}
    </StyledMenuDropdown>
  )
}
