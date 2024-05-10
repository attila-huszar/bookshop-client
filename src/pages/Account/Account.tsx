import { Avatar, Button } from '../../components'
import { useAppSelector } from '../../hooks'
import { userSelector } from '../../store'
import {
  StyledAccount,
  UserDataFields,
  BaseDetails,
  OtherDetails,
} from './Account.styles'

export function Account() {
  const { userData } = useAppSelector(userSelector)

  return (
    <StyledAccount>
      <h2>
        Hello, <span>{userData?.firstName}</span>!
      </h2>
      <UserDataFields>
        <BaseDetails>
          <Avatar
            imgUrl={userData?.avatar as string}
            size={120}
            title="Change Profile Picture"
            $clip
            $camera
          />
          <p>
            {userData?.firstName} {userData?.lastName} ({userData?.email})
          </p>
          <div>
            <Button $size="sm" $textSize="sm" $inverted>
              Edit Name
            </Button>
            <Button $size="sm" $textSize="sm" $inverted>
              Edit Password
            </Button>
          </div>
        </BaseDetails>
        <OtherDetails>
          <p>Address:</p>
          <p>Phone: {userData?.phone}</p>
        </OtherDetails>
      </UserDataFields>
    </StyledAccount>
  )
}
