import { useTranslation } from 'react-i18next'
import { LoadingIcon } from '@/assets/svg'
import { StyledLoading, Text } from './Loading.style'

type Props = {
  message?: string
  color?: string
  fullScreen?: boolean
}

export function Loading({
  message,
  color = 'var(--color-on-surface)',
  fullScreen = false,
}: Props) {
  const { t } = useTranslation()

  return (
    <StyledLoading $fullScreen={fullScreen} role="status">
      <LoadingIcon color={color} />
      <Text style={{ color }}>{message ?? t('common.loading')}</Text>
    </StyledLoading>
  )
}
