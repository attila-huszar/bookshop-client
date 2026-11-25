import { useTranslation } from 'react-i18next'
import { LoadingIcon } from '@/assets/svg'
import { StyledLoading, Text } from './Loading.style'

type Props = {
  message?: string
  messageId?: string
  fullScreen?: boolean
}

export function Loading({ message, messageId, fullScreen = false }: Props) {
  const { t } = useTranslation()

  return (
    <StyledLoading $fullScreen={fullScreen} role="status">
      <LoadingIcon />
      <Text id={messageId}>{message ?? t('common.loading')}</Text>
    </StyledLoading>
  )
}
