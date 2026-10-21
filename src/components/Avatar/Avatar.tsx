import { useTranslation } from 'react-i18next'
import { useUpdateUserProfileMutation } from '@/store/api/bookshopApi'
import { toast } from '@/components/AppToaster'
import { getErrorMessage } from '@/helpers/errors'
import { BinIcon, CameraIcon, SpinnerIcon, UserIcon } from '@/assets/svg'
import { IconOverlay, RemoveAvatar, StyledAvatar } from './Avatar.style'
import { AvatarTypes } from './Avatar.types'

export function Avatar({ imgUrl, $size = 40, ...props }: AvatarTypes) {
  const { t } = useTranslation()

  const [updateUserProfile, avatarRemoval] = useUpdateUserProfileMutation()

  const handleRemoveAvatar = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    try {
      await updateUserProfile({ avatar: null }).unwrap()
    } catch (error) {
      toast.error(getErrorMessage(error, t('account.removeAvatarError')))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      props.onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
    }
  }

  return (
    <StyledAvatar
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      $size={$size}
      {...props}>
      {props.$hoverControls && (
        <>
          {imgUrl && (
            <RemoveAvatar
              onClick={(e) => {
                void handleRemoveAvatar(e)
              }}
              disabled={avatarRemoval.isLoading}
              aria-busy={avatarRemoval.isLoading}
              title={t('account.removeAvatar')}>
              {avatarRemoval.isLoading ? <SpinnerIcon /> : <BinIcon />}
            </RemoveAvatar>
          )}
          <IconOverlay>
            <CameraIcon />
          </IconOverlay>
        </>
      )}
      {imgUrl ? (
        <img src={imgUrl} alt={props.title} />
      ) : (
        <UserIcon
          color="var(--color-on-surface-variant)"
          data-testid="default-avatar-icon"
        />
      )}
    </StyledAvatar>
  )
}
