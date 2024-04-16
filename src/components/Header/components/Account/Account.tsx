import { useNavigate } from 'react-router-dom'
import { IconButton } from '../../../../components'
import AccountIcon from '../../../../assets/svg/account.svg?react'

export function Account() {
  const navigate = useNavigate()

  return (
    <IconButton
      onClick={() => navigate('/registration')}
      icon={<AccountIcon />}
      title="Account"
      $iconSize="sm"
    />
  )
}
