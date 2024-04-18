import { useNavigate } from 'react-router-dom'
import { IconButton } from '../../../../components'
import { useAppSelector } from '../../../../hooks'
import { userSelector } from '../../../../store'
import AccountIcon from '../../../../assets/svg/account.svg?react'
import AccountLoggedInIcon from '../../../../assets/svg/account_loggedin.svg?react'

export function Account() {
  const navigate = useNavigate()
  const user = useAppSelector(userSelector)

  return (
    <IconButton
      onClick={() => navigate('/registration')}
      icon={user.firstName ? <AccountLoggedInIcon /> : <AccountIcon />}
      title={user.firstName || 'Account'}
      $iconSize="sm"
    />
  )
}
