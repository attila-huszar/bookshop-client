import { StyledLayout } from './styles/Layout.styles'
import { PropsWithChildren } from 'react'

export function Layout({ children }: PropsWithChildren) {
  return <StyledLayout>{children}</StyledLayout>
}
