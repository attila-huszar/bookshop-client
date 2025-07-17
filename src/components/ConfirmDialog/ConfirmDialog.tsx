import { FC, useEffect } from 'react'
import { StyledConfirmDialog } from './ConfirmDialog.style'
import { Button } from '../Button/Button'

type Props = {
  ref: React.RefObject<HTMLDialogElement | null>
  isDialogOpen: boolean
  handleConfirm: () => void
  handleCancel: () => void
  message: string
  buttonText?: string
  buttonColor?: 'primary' | 'secondary' | 'danger'
}

export const ConfirmDialog: FC<Props> = ({
  ref,
  isDialogOpen,
  handleConfirm,
  handleCancel,
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
    <StyledConfirmDialog ref={ref} onCancel={handleCancel}>
      <p>{message}</p>
      <div>
        <Button onClick={handleCancel} $color={buttonColor} $inverted>
          Cancel
        </Button>
        <Button onClick={handleConfirm} $color={buttonColor}>
          {buttonText}
        </Button>
      </div>
    </StyledConfirmDialog>
  )
}
