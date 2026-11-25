import { RefObject, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { XIcon } from '@/assets/svg'
import { DialogCloseButton } from '@/styles/dialog.styles'
import { StyledInfoDialog } from './InfoDialog.style'

type InfoDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>
  message: string
  error?: unknown
  reloadButton?: boolean
  backButton?: boolean
  dismissible?: boolean
}

export function InfoDialog({
  dialogRef,
  message,
  error,
  reloadButton,
  backButton,
  dismissible = false,
}: InfoDialogProps) {
  const { t } = useTranslation()
  const messageId = useId()

  return (
    <StyledInfoDialog ref={dialogRef} aria-labelledby={messageId}>
      {dismissible && Boolean(error) && (
        <DialogCloseButton
          type="button"
          aria-label={t('common.actions.close')}
          title={t('common.actions.close')}
          icon={<XIcon aria-hidden="true" />}
          onClick={() => dialogRef.current?.close()}
        />
      )}
      {error ? (
        <Alert message={message} messageId={messageId} error={error} />
      ) : (
        <Loading message={message} messageId={messageId} />
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
