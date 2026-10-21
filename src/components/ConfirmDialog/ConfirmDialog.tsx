import { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickOutside } from '@/hooks/useClickOutside'
import { SpinnerIcon } from '@/assets/svg'
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

  if (!isDialogOpen) return null

  return (
    <StyledConfirmDialog
      ref={ref}
      aria-busy={isLoading}
      onCancel={(event) => {
        if (isLoading) {
          event.preventDefault()

          return
        }

        setIsDialogOpen(false)
      }}>
      <p>{message}</p>
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
