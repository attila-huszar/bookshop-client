import { FC, useEffect, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickOutside } from '@/hooks/useClickOutside'
import { SpinnerIcon, XIcon } from '@/assets/svg'
import { DialogCloseButton } from '@/styles/dialog.styles'
import { Button } from '../Button/Button'
import type { ButtonColor } from '../Button/Button.types'
import { StyledConfirmDialog } from './ConfirmDialog.style'

type Props = {
  ref: React.RefObject<HTMLDialogElement | null>
  isDialogOpen: boolean
  setIsDialogOpen: (isOpen: boolean) => void
  handleConfirm: () => void
  message: string
  buttonText?: string
  buttonColor?: ButtonColor
  isLoading?: boolean
}

export const ConfirmDialog: FC<Props> = ({
  ref,
  isDialogOpen,
  setIsDialogOpen,
  handleConfirm,
  message,
  buttonText,
  buttonColor = 'primary',
  isLoading = false,
}) => {
  const { t } = useTranslation()
  const messageId = useId()

  useEffect(() => {
    if (isDialogOpen) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [isDialogOpen, ref])

  useClickOutside(ref, () => {
    if (!isLoading) {
      setIsDialogOpen(false)
    }
  })

  if (!isDialogOpen) {
    return null
  }

  return (
    <StyledConfirmDialog
      ref={ref}
      aria-labelledby={messageId}
      aria-busy={isLoading}
      onCancel={(event) => {
        if (isLoading) {
          event.preventDefault()

          return
        }

        setIsDialogOpen(false)
      }}>
      <DialogCloseButton
        type="button"
        aria-label={t('common.actions.close')}
        title={t('common.actions.close')}
        icon={<XIcon aria-hidden="true" />}
        disabled={isLoading}
        onClick={() => setIsDialogOpen(false)}
      />
      <p id={messageId}>{message}</p>
      <div>
        <Button
          onClick={() => setIsDialogOpen(false)}
          $color="neutral"
          disabled={isLoading}>
          {t('common.actions.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          $color={buttonColor}
          disabled={isLoading}>
          {isLoading && <SpinnerIcon height={22} aria-hidden="true" />}
          {buttonText ?? t('common.actions.ok')}
        </Button>
      </div>
    </StyledConfirmDialog>
  )
}
