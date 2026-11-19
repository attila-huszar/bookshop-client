import type { ReactNode } from 'react'
import { StyledMenuDropdown } from './MenuDropdown.styles'

type Props = { id: string; show: boolean; children: ReactNode }

export function MenuDropdown({ id, show, children }: Props) {
  return (
    <StyledMenuDropdown id={id} $show={show}>
      {children}
    </StyledMenuDropdown>
  )
}
