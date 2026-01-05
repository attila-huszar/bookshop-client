import { StyledLoading, Text } from './Loading.style'
import { LoadingIcon } from '@/assets/svg'

type Props = {
  message?: string
  color?: string
  fullScreen?: boolean
}

export function Loading({
  message = 'Loading',
  color = 'var(--black)',
  fullScreen = false,
}: Props) {
  return (
    <StyledLoading $fullScreen={fullScreen}>
      <LoadingIcon color={color} />
      <Text style={{ color }}>{message}</Text>
    </StyledLoading>
  )
}
