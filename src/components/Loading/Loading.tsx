import { StyledLoading } from './Loading.styles'
import LoadingIcon from '../../assets/svg/loading.svg?react'

export function Loading() {
  return (
    <StyledLoading>
      <LoadingIcon color="#fff" />
      <p>Loading...</p>
    </StyledLoading>
  )
}
