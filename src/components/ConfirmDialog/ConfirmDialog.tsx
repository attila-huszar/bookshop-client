import { FC, useEffect } from 'react'
import { Button } from '../Button/Button'
import { StyledConfirmDialog } from './ConfirmDialog.style'

type Props = {
  ref: React.RefObject<HTMLDialogElement | null>
  isDialogOpen: boolean
  setIsDialogOpen: (isOpen: boolean) => void
  handleConfirm: () => void
  message: string
  buttonText?: string
  buttonColor?: 'primary' | 'secondary' | 'danger'
}

export const ConfirmDialog: FC<Props> = ({
  ref,
  isDialogOpen,
  setIsDialogOpen,
  handleConfirm,
  message,
  buttonText = 'OK',
  buttonColor = 'primary',
}) => {
  useEffect(() => {
    if (isDialogOpen) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [isDialogOpen, ref])

  if (!isDialogOpen) return null

  return (
    <StyledConfirmDialog ref={ref} onCancel={() => setIsDialogOpen(false)}>
      <p>{message}</p>
      <div>
        <Button
          onClick={() => setIsDialogOpen(false)}
          $color={buttonColor}
          $inverted>
          Cancel
        </Button>
        <Button onClick={handleConfirm} $color={buttonColor}>
          {buttonText}
        </Button>
      </div>
    </StyledConfirmDialog>
  )
}
