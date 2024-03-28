import { IconButton } from '../../../../components'
import accountIcon from '../../../../assets/svg/account.svg'

export function Account() {
  return (
    <IconButton>
      <img src={accountIcon} alt="account" />
    </IconButton>
  )
}
