import { StyledTable } from '../Tabs/Tabs.style'
import { InfoDialog } from '@/components'
import { cmsUsersSelector } from '@/store'
import { useAppSelector } from '@/hooks'

export const Users = () => {
  const { users, usersIsLoading, usersError } = useAppSelector(cmsUsersSelector)

  if (usersIsLoading) {
    return <InfoDialog message="Loading users..." />
  }

  if (usersError) {
    return <InfoDialog message="Error loading users" error={usersError} />
  }

  return (
    <StyledTable>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Address</th>
            <th>Avatar</th>
            <th>Verified</th>
            <th>Created</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            return (
              <tr key={user.uuid}>
                <td>{user.id}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {user.address && Object.values(user.address).join(', ')}
                </td>
                <td>
                  {user.avatar && (
                    <img src={user.avatar} alt="User avatar" height={32} />
                  )}
                </td>
                <td>{user.verified ? '✔️' : '❌'}</td>
                <td>
                  {new Date(user.createdAt).toLocaleString('hu-HU', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td>
                  {new Date(user.updatedAt).toLocaleString('hu-HU', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </StyledTable>
  )
}
