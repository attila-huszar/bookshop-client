import { IconButton } from '../../../../components'
import menuIcon from '../../../../assets/svg/menu.svg'

export function Menu() {
  return (
    <IconButton>
      <img src={menuIcon} alt="menu" />
    </IconButton>
  )
}
