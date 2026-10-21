import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { getErrorMessage } from '@/helpers/errors'
import { InfoIcon, WarningIcon } from '@/assets/svg'
import { Button } from '../Button/Button'
import { StyledAlert } from './Alert.style'

type Props = {
  type?: 'info' | 'warning'
  message?: string
  error?: unknown
  fullScreen?: boolean
  backButton?: boolean
}

export function Alert({
  type = 'warning',
  message,
  error,
  fullScreen = false,
  backButton,
}: Props) {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const handleGoBack = () => {
    const hasPreviousPage = window.history.length > 2
    if (hasPreviousPage) {
      void navigate(-1)
    } else {
      void navigate('/')
    }
  }

  return (
    <StyledAlert $fullScreen={fullScreen}>
      {type === 'warning' ? <WarningIcon /> : <InfoIcon />}
      <div>
        <p>{message ?? t('common.error')}</p>
        {Boolean(error) && (
          <p>
            {typeof error === 'string'
              ? t(error, { defaultValue: error })
              : getErrorMessage(error, t('common.error'))}
          </p>
        )}
      </div>
      {backButton && (
        <Button type="button" onClick={handleGoBack}>
          {t('common.actions.goBack')}
        </Button>
      )}
    </StyledAlert>
  )
}
