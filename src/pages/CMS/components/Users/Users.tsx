import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import { useCmsUsersQuery } from '@/store/api/bookshopApi'
import { Alert } from '@/components/Alert'
import { IconButton } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { CMSOutletContext } from '@/types'
import { EditIcon } from '@/assets/svg'
import { StyledTable, TableActions } from '../../styles/CMS.style'

export const Users = () => {
  const { t } = useTranslation()

  const {
    data: allUsers = [],
    isLoading: usersLoading,
    error: usersError,
  } = useCmsUsersQuery()
  const {
    showDeletedUsers,
    selectedItems,
    setSelectedItems,
    setIsDialogOpen,
    setIsEditing,
    setEditedItem,
  } = useOutletContext<CMSOutletContext>()
  const users = allUsers.filter(
    (user) => Boolean(user.deletedAt) === showDeletedUsers,
  )

  if (usersLoading) {
    return <Loading message={t('cms.usersLoading')} fullScreen />
  }

  if (usersError) {
    return <Alert message={t('cms.usersError')} error={usersError} />
  }

  if (users.length === 0) {
    return (
      <Alert
        message={
          showDeletedUsers ? t('cms.usersRemovedEmpty') : t('cms.usersEmpty')
        }
      />
    )
  }

  const allSelected =
    users.length > 0 && selectedItems.users.length === users.length

  const sortedUsers = [...users].sort((a, b) => {
    if (a.id === undefined || b.id === undefined) {
      return 0
    }

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
                aria-label={t('common.selectAll')}
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
            <th>{t('common.fields.id')}</th>
            <th>{t('common.fields.firstName')}</th>
            <th>{t('common.fields.lastName')}</th>
            <th>{t('common.fields.email')}</th>
            <th>{t('common.fields.role')}</th>
            <th>{t('common.fields.address')}</th>
            <th>{t('common.fields.avatar')}</th>
            <th>{t('common.fields.verified')}</th>
            <th>{t('common.fields.createdAt')}</th>
            <th>{t('common.fields.updatedAt')}</th>
            <th className="actions">{t('common.fields.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => {
            return (
              <tr
                key={user.id}
                onClick={() => {
                  setIsEditing(false)
                  setEditedItem(user)
                  setIsDialogOpen(true)
                }}
                className={
                  selectedItems.users.includes(user.id) ? 'selected' : ''
                }>
                <td
                  style={{ textAlign: 'center' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedItems((prev) => ({
                      ...prev,
                      users: prev.users.includes(user.id)
                        ? prev.users.filter((id) => id !== user.id)
                        : [...prev.users, user.id],
                    }))
                  }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.users.includes(user.id)}
                    aria-label={t('cms.selectRecord', {
                      entity: t('cms.user').toLocaleLowerCase(),
                      id: user.id,
                    })}
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
                <td>{t(`cms.roles.${user.role}`)}</td>
                <td>
                  {user.address &&
                    Object.values(user.address).filter(Boolean).join(', ')}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={t('cms.userAvatar')}
                      height={32}
                    />
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
                <td className="actions">
                  <TableActions>
                    <IconButton
                      type="button"
                      title={t('cms.edit', {
                        entity: t('cms.user').toLocaleLowerCase(),
                      })}
                      aria-label={t('cms.editRecord', {
                        entity: t('cms.user').toLocaleLowerCase(),
                        id: user.id,
                      })}
                      disabled={showDeletedUsers}
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsEditing(true)
                        setIsDialogOpen(true)
                        setEditedItem(user)
                      }}
                      icon={<EditIcon aria-hidden="true" />}
                      $size="sm"
                    />
                  </TableActions>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </StyledTable>
  )
}
