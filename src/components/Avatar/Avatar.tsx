import { useTranslation } from 'react-i18next'
import { useUpdateUserProfileMutation } from '@/store/api/usersApi'
import { toast } from '@/components/AppToaster'
import { getErrorMessage } from '@/helpers/errors'
import { BinIcon, CameraIcon, SpinnerIcon, UserIcon } from '@/assets/svg'
import {
  AvatarButton,
  IconOverlay,
  RemoveAvatar,
  StyledAvatar,
} from './Avatar.style'
import { AvatarTypes } from './Avatar.types'

export function Avatar(options: AvatarTypes) {
  const { imgUrl, $size = 40, $hoverControls, ...buttonProps } = options
  const { t, i18n } = useTranslation()

  const [updateUserProfile, avatarRemoval] = useUpdateUserProfileMutation()

  const handleRemoveAvatar = async () => {
    try {
      await updateUserProfile({ avatar: null }).unwrap()
    } catch (error) {
      toast.error(getErrorMessage(error, i18n.t('account.removeAvatarError')))
    }
  }

  return (
    <StyledAvatar $size={$size}>
      <AvatarButton
        type="button"
        aria-label={buttonProps.title}
        $hoverControls={$hoverControls}
        {...buttonProps}>
        {$hoverControls && (
          <IconOverlay aria-hidden="true">
            <CameraIcon />
          </IconOverlay>
        )}
        {imgUrl ? (
          <img src={imgUrl} alt={buttonProps.title ?? ''} />
        ) : (
          <UserIcon
            aria-hidden="true"
            color="var(--color-on-surface-variant)"
            data-testid="default-avatar-icon"
          />
        )}
      </AvatarButton>
      {$hoverControls && imgUrl && (
        <RemoveAvatar
          type="button"
          onClick={() => void handleRemoveAvatar()}
          disabled={avatarRemoval.isLoading}
          aria-busy={avatarRemoval.isLoading}
          aria-label={t('account.removeAvatar')}
          title={t('account.removeAvatar')}>
          {avatarRemoval.isLoading ? (
            <SpinnerIcon aria-hidden="true" />
          ) : (
            <BinIcon aria-hidden="true" />
          )}
        </RemoveAvatar>
      )}
    </StyledAvatar>
  )
}
