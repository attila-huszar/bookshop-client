import { useNavigate } from 'react-router-dom'
import { IconButton } from '../../../../components'
import { useAppSelector } from '../../../../hooks'
import { userSelector } from '../../../../store/selectors'
import AccountIcon from '../../../../assets/svg/account.svg?react'
import AccountLoggedInIcon from '../../../../assets/svg/account_loggedin.svg?react'

export function Account() {
  const navigate = useNavigate()
  const user = useAppSelector(userSelector)

  return (
    <IconButton
      onClick={() => navigate('/registration')}
      icon={user ? <AccountLoggedInIcon /> : <AccountIcon />}
      title="Account"
      $iconSize="sm"
    />
  )
}
