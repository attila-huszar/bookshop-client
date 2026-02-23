import { RefObject } from 'react'
import { Alert, Button, Loading } from '@/components'
import { StyledInfoDialog } from './InfoDialog.style'

type InfoDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>
  message: string
  error?: string | null
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
  return (
    <StyledInfoDialog ref={dialogRef}>
      {error ? (
        <Alert message={message} error={error} />
      ) : (
        <Loading message={message} />
      )}
      {reloadButton && (
        <Button onClick={() => window.location.reload()}>Reload Page</Button>
      )}
      {backButton && (
        <Button onClick={() => window.location.replace('/')}>Go Back</Button>
      )}
    </StyledInfoDialog>
  )
}
