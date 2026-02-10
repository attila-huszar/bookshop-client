import { updateUserProfile } from '@/store'
import { useAppDispatch } from '@/hooks'
import { AccountDefaultIcon, BinIcon, CameraIcon } from '@/assets/svg'
import { IconOverlay, RemoveAvatar, StyledAvatar } from './Avatar.style'
import { AvatarTypes } from './Avatar.types'

export function Avatar({ imgUrl, $size = 40, ...props }: AvatarTypes) {
  const dispatch = useAppDispatch()

  const handleRemoveAvatar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    void dispatch(updateUserProfile({ avatar: '' }))
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
        <AccountDefaultIcon
          color="var(--light-black)"
          data-testid="default-avatar-icon"
        />
      )}
    </StyledAvatar>
  )
}
