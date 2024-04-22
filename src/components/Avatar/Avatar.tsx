import { Cloudinary } from '@cloudinary/url-gen'
import { AdvancedImage } from '@cloudinary/react'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { cloudName } from '../../lib/envVariables'
import { StyledAvatar } from './Avatar.styles'

export const Avatar = ({ imgUrl }: { imgUrl: string }) => {
  const cld = new Cloudinary({
    cloud: {
      cloudName,
    },
  })

  const avatar = cld.image(imgUrl.split('/').pop())

  avatar.resize(fill().width(40).height(40))

  return (
    <StyledAvatar>
      <AdvancedImage cldImg={avatar} />
    </StyledAvatar>
  )
}
