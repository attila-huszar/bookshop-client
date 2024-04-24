import { CloudinaryImage } from '@cloudinary/url-gen'
import { cloudConfig } from '../../utils/cloudinaryConfig'
import { thumbnail } from '@cloudinary/url-gen/actions/resize'
import { focusOn } from '@cloudinary/url-gen/qualifiers/gravity'
import { face } from '@cloudinary/url-gen/qualifiers/focusOn'
import { AdvancedImage } from '@cloudinary/react'
import { StyledAvatar } from './Avatar.styles'
import { IAvatar } from '../../interfaces'
import { useMemo } from 'react'

export const Avatar = ({ imgUrl, onClick, title }: IAvatar) => {
  const avatar = useMemo(
    () =>
      new CloudinaryImage(
        `bookstore/avatars/${imgUrl.split('/').pop()}`,
        cloudConfig,
      ).resize(thumbnail().width(44).height(44).gravity(focusOn(face()))),
    [imgUrl],
  )

  return (
    <StyledAvatar onClick={onClick} title={title}>
      <AdvancedImage cldImg={avatar} />
    </StyledAvatar>
  )
}
