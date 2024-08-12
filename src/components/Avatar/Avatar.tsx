import { StyledAvatar } from './Avatar.styles'
import { AvatarTypes } from './Avatar.types'
import { CloudinaryImage } from '@cloudinary/url-gen'
import { cloudinaryConfig, cloudinaryUploadPreset } from 'services'
import { thumbnail } from '@cloudinary/url-gen/actions/resize'
import { focusOn } from '@cloudinary/url-gen/qualifiers/gravity'
import { face } from '@cloudinary/url-gen/qualifiers/focusOn'
import { AdvancedImage } from '@cloudinary/react'
import AccountDefaultIcon from 'assets/svg/account_default.svg?react'

export function Avatar({
  imgUrl,
  onClick,
  title,
  $size = 40,
  ...props
}: AvatarTypes) {
  const avatar = imgUrl
    ? new CloudinaryImage(
        `${cloudinaryUploadPreset}/avatars/${imgUrl.split('/').pop()}`,
        cloudinaryConfig,
      ).resize(thumbnail().width($size).height($size).gravity(focusOn(face())))
    : null

  return (
    <StyledAvatar onClick={onClick} $size={$size} title={title} {...props}>
      {avatar ? (
        <AdvancedImage cldImg={avatar} />
      ) : (
        <AccountDefaultIcon color="var(--light-black)" />
      )}
    </StyledAvatar>
  )
}
