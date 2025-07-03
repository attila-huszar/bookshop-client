import { IconButton } from '@/components'
import { FavoriteIcon } from '@/assets/svg'

export function Favorite() {
  return (
    <IconButton
      onClick={() => undefined}
      icon={<FavoriteIcon />}
      title="Favorite"
    />
  )
}
