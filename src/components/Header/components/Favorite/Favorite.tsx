import { IconButton } from 'components'
import FavoriteIcon from 'assets/svg/favorite.svg?react'

export function Favorite() {
  return (
    <IconButton
      onClick={() => undefined}
      icon={<FavoriteIcon />}
      title="Favorite"
    />
  )
}
