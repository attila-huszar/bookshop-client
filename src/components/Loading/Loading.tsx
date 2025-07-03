import { StyledLoading, Text } from './Loading.style'
import { LoadingIcon } from '@/assets/svg'

type Props = {
  text?: string
  color?: string
  fullScreen?: boolean
}

export function Loading({
  text = 'Loading',
  color = 'var(--black)',
  fullScreen,
}: Props) {
  return (
    <StyledLoading $fullScreen={fullScreen}>
      <LoadingIcon color={color} />
      <Text style={{ color }}>{text}</Text>
    </StyledLoading>
  )
}
