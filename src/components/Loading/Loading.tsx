import { LoadingIcon } from '@/assets/svg'
import { StyledLoading, Text } from './Loading.style'

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
