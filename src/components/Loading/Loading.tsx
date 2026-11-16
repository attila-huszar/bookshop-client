import { useTranslation } from 'react-i18next'
import { LoadingIcon } from '@/assets/svg'
import { StyledLoading, Text } from './Loading.style'

type Props = {
  message?: string
  fullScreen?: boolean
}

export function Loading({ message, fullScreen = false }: Props) {
  const { t } = useTranslation()
  const color = fullScreen
    ? 'var(--color-on-primary)'
    : 'var(--color-on-surface)'

  return (
    <StyledLoading $fullScreen={fullScreen} role="status">
      <LoadingIcon color={color} />
      <Text style={{ color }}>{message ?? t('common.loading')}</Text>
    </StyledLoading>
  )
}
