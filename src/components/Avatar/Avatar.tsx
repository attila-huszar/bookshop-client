import { CloudinaryImage } from '@cloudinary/url-gen'
import { cloudConfig } from '../../utils/cloudinaryConfig'
import { thumbnail } from '@cloudinary/url-gen/actions/resize'
import { focusOn } from '@cloudinary/url-gen/qualifiers/gravity'
import { face } from '@cloudinary/url-gen/qualifiers/focusOn'
import { AdvancedImage } from '@cloudinary/react'
import { StyledAvatar } from './Avatar.styles'
import { IAvatar } from '../../interfaces'

export const Avatar = ({ imgUrl, onClick, title }: IAvatar) => {
  const avatar = new CloudinaryImage(
    `bookstore/avatars/${imgUrl.split('/').pop()}`,
    cloudConfig,
  ).resize(thumbnail().width(40).height(40).gravity(focusOn(face())))

  return (
    <StyledAvatar onClick={onClick} title={title}>
      <AdvancedImage cldImg={avatar} />
    </StyledAvatar>
  )
}
