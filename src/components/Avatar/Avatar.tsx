import { RemoveAvatar, IconOverlay, StyledAvatar } from './Avatar.style'
import { AvatarTypes } from './Avatar.types'
import { useAppDispatch } from '@/hooks'
import { updateUser } from '@/store'
import AccountDefaultIcon from '@/assets/svg/account_default.svg?react'
import CameraIcon from '@/assets/svg/camera.svg?react'
import BinIcon from '@/assets/svg/bin.svg?react'

export function Avatar({ imgUrl, $size = 40, ...props }: AvatarTypes) {
  const dispatch = useAppDispatch()

  const handleRemoveAvatar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    void dispatch(updateUser({ avatar: '' }))
  }

  return (
    <StyledAvatar onClick={props.onClick} $size={$size} {...props}>
      {props.$hoverControls && (
        <>
          {imgUrl && (
            <RemoveAvatar onClick={handleRemoveAvatar} title="Remove Avatar">
              <BinIcon />
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
        <AccountDefaultIcon color="var(--light-black)" />
      )}
    </StyledAvatar>
  )
}
