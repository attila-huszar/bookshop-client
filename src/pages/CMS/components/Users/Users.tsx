import { useEffect, useState } from 'react'
import { StyledTable } from '../Tabs/Tabs.style'
import { fetchAllUsers } from '@/store'
import { useAppDispatch } from '@/hooks'
import { User } from '@/types'

export const Users = () => {
  const dispatch = useAppDispatch()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    dispatch(fetchAllUsers())
      .unwrap()
      .then(setUsers)
      .catch((err) =>
        setError(typeof err === 'string' ? err : 'Failed to fetch users'),
      )
      .finally(() => setLoading(false))
  }, [dispatch])

  return (
    <StyledTable>
      {loading && <p>Loading users...</p>}
      {error && <p>{error}</p>}
      {!loading && (
        <table>
          <thead>
            <tr>
              <th>UUID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Address</th>
              <th>Avatar</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              user.address ??= {}

              return (
                <tr key={user.uuid}>
                  <td>{user.uuid}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{Object.values(user.address).join(', ')}</td>
                  <td>
                    {user.avatar && <img src={user.avatar} height={32} />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </StyledTable>
  )
}
