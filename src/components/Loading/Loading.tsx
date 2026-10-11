import { LoadingIcon } from '@/assets/svg'
import { StyledLoading, Text } from './Loading.style'

type Props = {
  message?: string
  color?: string
  fullScreen?: boolean
}

export function Loading({
  message = 'Loading',
  color = 'var(--color-on-surface)',
  fullScreen = false,
}: Props) {
  return (
    <StyledLoading $fullScreen={fullScreen} role="status">
      <LoadingIcon color={color} />
      <Text style={{ color }}>{message}</Text>
    </StyledLoading>
  )
}
