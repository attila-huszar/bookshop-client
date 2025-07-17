import { Button, Error, Loading } from '@/components'
import { StyledInfoDialog } from './InfoDialog.style'

export function InfoDialog({
  dialogRef,
  message,
  error,
  reloadButton,
  backButton,
}: {
  dialogRef?: React.RefObject<HTMLDialogElement | null>
  message: string
  error?: string | null
  reloadButton?: boolean
  backButton?: boolean
}) {
  return (
    <StyledInfoDialog ref={dialogRef}>
      {error ? (
        <Error message={message} error={error} />
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
