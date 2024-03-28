import { IconButton } from '../../../../components'
import favoriteIcon from '../../../../assets/svg/favorite.svg'

export function Favorite() {
  return (
    <IconButton>
      <img src={favoriteIcon} alt="favorite" />
    </IconButton>
  )
}
