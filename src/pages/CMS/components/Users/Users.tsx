import { useOutletContext } from 'react-router'
import { StyledTable } from '../Tabs/Tabs.style'
import { Alert, IconButton } from '@/components'
import { cmsUsersSelector } from '@/store'
import { useAppSelector } from '@/hooks'
import { CMSOutletContext } from '@/types'
import { EditIcon } from '@/assets/svg'

export const Users = () => {
  const { users, usersLoading, usersError } = useAppSelector(cmsUsersSelector)
  const {
    selectedItems,
    setSelectedItems,
    setIsEditDialogOpen,
    setEditedItem,
  } = useOutletContext<CMSOutletContext>()

  if (usersError) {
    return <Alert message="Error loading users" error={usersError} />
  }

  if (!usersLoading && users.length === 0) {
    return <Alert message="No users found" />
  }

  const allSelected =
    users.length > 0 && selectedItems.users.length === users.length

  const sortedUsers = [...users].sort((a, b) => {
    if (a.id === undefined || b.id === undefined) return 0
    return a.id - b.id
  })

  return (
    <StyledTable>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() =>
                  allSelected
                    ? setSelectedItems({
                        ...selectedItems,
                        users: [],
                      })
                    : setSelectedItems({
                        ...selectedItems,
                        users: users.map((user) => user.id),
                      })
                }
              />
            </th>
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
            <th style={{ width: 40, padding: 0 }}></th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => {
            return (
              <tr
                key={user.id}
                onClick={() => {
                  setSelectedItems({
                    ...selectedItems,
                    users: selectedItems.users.includes(user.id)
                      ? selectedItems.users.filter((id) => id !== user.id)
                      : [...selectedItems.users, user.id],
                  })
                }}
                className={
                  selectedItems.users.includes(user.id) ? 'selected' : ''
                }>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.users.includes(user.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => {
                      setSelectedItems((prev) => ({
                        ...prev,
                        users: prev.users.includes(user.id)
                          ? prev.users.filter((id) => id !== user.id)
                          : [...prev.users, user.id],
                      }))
                    }}
                  />
                </td>
                <td>{user.id}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {user.address && Object.values(user.address).join(', ')}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {user.avatar && (
                    <img src={user.avatar} alt="User avatar" height={32} />
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {user.verified ? '✔️' : '❌'}
                </td>
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
                <td style={{ padding: 0 }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditDialogOpen(true)
                      setEditedItem(user)
                    }}
                    icon={<EditIcon />}
                    $iconSize="sm"
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </StyledTable>
  )
}
