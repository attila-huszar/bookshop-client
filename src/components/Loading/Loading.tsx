import { StyledLoading } from './Loading.styles'
import LoadingIcon from 'assets/svg/loading.svg?react'

export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <StyledLoading>
      <LoadingIcon color="#fff" />
      <p>{text}</p>
    </StyledLoading>
  )
}
