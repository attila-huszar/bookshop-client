import { Button, Error, Loading } from '@/components'
import { StyledInfoDialog } from './InfoDialog.style'

export function InfoDialog({
  dialogRef,
  text,
  error,
  reloadButton,
  backButton,
}: {
  dialogRef: React.RefObject<HTMLDialogElement>
  text: string
  error?: string
  reloadButton?: boolean
  backButton?: boolean
}) {
  return (
    <StyledInfoDialog ref={dialogRef}>
      {error ? <Error text={text} error={error} /> : <Loading text={text} />}
      {reloadButton && (
        <Button onClick={() => window.location.reload()}>Reload Page</Button>
      )}
      {backButton && (
        <Button onClick={() => window.location.replace('/')}>Go Back</Button>
      )}
    </StyledInfoDialog>
  )
}
