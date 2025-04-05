import { CameraOverlay, StyledAvatar } from './Avatar.style'
import { AvatarTypes } from './Avatar.types'
import AccountDefaultIcon from '@/assets/svg/account_default.svg?react'
import CameraIcon from '@/assets/svg/camera.svg?react'

export function Avatar({
  imgUrl,
  onClick,
  title,
  $size = 40,
  ...props
}: AvatarTypes) {
  return (
    <StyledAvatar onClick={onClick} $size={$size} {...props}>
      <CameraOverlay>
        <CameraIcon />
      </CameraOverlay>
      {imgUrl ? (
        <img src={imgUrl} alt={title} />
      ) : (
        <AccountDefaultIcon color="var(--light-black)" />
      )}
    </StyledAvatar>
  )
}
