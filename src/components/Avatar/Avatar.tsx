import { useMemo } from 'react'
import { StyledAvatar } from './Avatar.styles'
import { AvatarTypes } from './Avatar.types'
import { CloudinaryImage } from '@cloudinary/url-gen'
import { cloudConfig } from '../../utils/cloudinaryConfig'
import { thumbnail } from '@cloudinary/url-gen/actions/resize'
import { focusOn } from '@cloudinary/url-gen/qualifiers/gravity'
import { face } from '@cloudinary/url-gen/qualifiers/focusOn'
import { AdvancedImage } from '@cloudinary/react'

export function Avatar({
  imgUrl,
  size = 40,
  onClick,
  title,
  ...props
}: AvatarTypes) {
  const avatar = useMemo(
    () =>
      new CloudinaryImage(
        `bookstore/avatars/${imgUrl.split('/').pop()}`,
        cloudConfig,
      ).resize(thumbnail().width(size).height(size).gravity(focusOn(face()))),
    [imgUrl, size],
  )

  return (
    <StyledAvatar onClick={onClick} title={title} {...props}>
      <AdvancedImage cldImg={avatar} />
    </StyledAvatar>
  )
}
