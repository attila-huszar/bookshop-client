import { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { StyledInfoDialog } from './InfoDialog.style'

type InfoDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>
  message: string
  error?: unknown
  reloadButton?: boolean
  backButton?: boolean
}

export function InfoDialog({
  dialogRef,
  message,
  error,
  reloadButton,
  backButton,
}: InfoDialogProps) {
  const { t } = useTranslation()

  return (
    <StyledInfoDialog ref={dialogRef}>
      {error ? (
        <Alert message={message} error={error} />
      ) : (
        <Loading message={message} />
      )}
      {reloadButton && (
        <Button onClick={() => window.location.reload()}>
          {t('common.actions.reloadPage')}
        </Button>
      )}
      {backButton && (
        <Button onClick={() => window.location.replace('/')}>
          {t('common.actions.goBack')}
        </Button>
      )}
    </StyledInfoDialog>
  )
}
