import { StyledLoading, Text } from './Loading.style'
import LoadingIcon from '@/assets/svg/loading.svg?react'

export function Loading({
  text = 'Loading',
  color = 'var(--black)',
}: {
  text?: string
  color?: string
}) {
  return (
    <StyledLoading>
      <LoadingIcon color={color} />
      <Text style={{ color }}>{text}</Text>
    </StyledLoading>
  )
}
