import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { userSelector } from '@/store'
import {
  useCmsAuthorsQuery,
  useCmsBooksQuery,
  useCmsOrdersQuery,
  useCmsUsersQuery,
  useHardDeleteAuthorsMutation,
  useHardDeleteBooksMutation,
  useRestoreOrdersMutation,
  useRestoreUsersMutation,
  useSoftDeleteOrdersMutation,
  useSoftDeleteUsersMutation,
} from '@/store/api/bookshopApi'
import {
  Button,
  ConfirmDialog,
  ExtraSpace,
  IconButton,
  toast,
} from '@/components'
import { useAppSelector, useClickOutside } from '@/hooks'
import type {
  Author,
  BookWithAuthorId,
  CmsEditedItem,
  CmsOrder,
  CmsUser,
  SelectContext,
} from '@/types'
import {
  LogoutIcon,
  StoreIcon,
  StoreSlashIcon,
  UserIcon,
  UserSlashIcon,
} from '@/assets/svg'
import {
  AuthorEditForm,
  BookEditForm,
  OrderEditForm,
  UserEditForm,
} from './components'
import {
  MainContainer,
  MenuButtons,
  StyledCMS,
  StyledEditDialog,
  StyledTabs,
} from './styles'

const TABS = [
  { label: 'Orders', value: 'orders' },
  { label: 'Books', value: 'books' },
  { label: 'Authors', value: 'authors' },
  { label: 'Users', value: 'users' },
] as const

export type TabValue = (typeof TABS)[number]['value']

const getEditedItem = <T extends CmsEditedItem>(
  item: CmsEditedItem | null,
): T | null => item as T | null

const isValidTab = (tab: string): tab is TabValue =>
  TABS.some((t) => t.value === tab)

export const CMS = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userData } = useAppSelector(userSelector)
  const [hardDeleteAuthors, authorDeletion] = useHardDeleteAuthorsMutation()
  const [hardDeleteBooks, bookDeletion] = useHardDeleteBooksMutation()
  const [softDeleteOrders, orderRemoval] = useSoftDeleteOrdersMutation()
  const [restoreOrders, orderRestoration] = useRestoreOrdersMutation()
  const [softDeleteUsers, userRemoval] = useSoftDeleteUsersMutation()
  const [restoreUsers, userRestoration] = useRestoreUsersMutation()
  const isActionPending = [
    authorDeletion,
    bookDeletion,
    orderRemoval,
    orderRestoration,
    userRemoval,
    userRestoration,
  ].some((mutation) => mutation.isLoading)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [showDeletedOrders, setShowDeletedOrders] = useState(false)
  const [showDeletedUsers, setShowDeletedUsers] = useState(false)
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false)
  const [selectedItems, setSelectedItems] = useState<SelectContext>({
    orders: [],
    books: [],
    authors: [],
    users: [],
  })
  const [editedItem, setEditedItem] = useState<CmsEditedItem | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const confirmRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (isDialogOpen) {
      dialog?.showModal()

      if (dialog) {
        dialog.scrollTop = 0
      }
    } else {
      dialog?.close()
    }
  }, [isDialogOpen])

  const activeTab = useMemo(() => {
    const tab = location.pathname.split('/').pop()

    if (tab && isValidTab(tab)) {
      return tab
    }

    return 'orders'
  }, [location.pathname])

  const supportsSoftDelete = activeTab === 'orders' || activeTab === 'users'
  const showDeleted =
    activeTab === 'orders' ? showDeletedOrders : showDeletedUsers
  const actionLabel = supportsSoftDelete
    ? showDeleted
      ? 'Restore'
      : 'Remove'
    : 'Delete'
  const isRestoring = supportsSoftDelete && showDeleted
  const actionColor = isRestoring ? 'secondary' : 'danger'
  const visibilityLabel = `Show ${showDeleted ? 'active' : 'removed'} ${activeTab}`
  const VisibilityIcon =
    activeTab === 'orders'
      ? showDeleted
        ? StoreIcon
        : StoreSlashIcon
      : showDeleted
        ? UserIcon
        : UserSlashIcon
  const confirmationMessage = isRestoring
    ? `Restore selected ${activeTab}? They will appear in the active list again.${activeTab === 'users' ? ' Account access will be restored.' : ''}`
    : supportsSoftDelete
      ? `Remove selected ${activeTab}? ${activeTab === 'users' ? 'Account access will be disabled; email addresses and order history will be retained.' : 'Order history, payments, and emails will be retained.'} You can restore them from the removed ${activeTab} view.`
      : `Delete selected ${activeTab} permanently? This action is irreversible. These records cannot be restored.`

  useCmsBooksQuery({ skip: activeTab !== 'books' })
  useCmsAuthorsQuery({
    skip: activeTab !== 'authors' && activeTab !== 'books',
  })
  useCmsOrdersQuery({ skip: activeTab !== 'orders' })
  useCmsUsersQuery({ skip: activeTab !== 'users' })

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setIsEditing(false)
    setEditedItem(null)
  }

  useClickOutside(dialogRef, handleDialogClose)

  const handleBulkActionClick = () => {
    if (!selectedItems[activeTab].length) {
      toast('No items selected', {
        icon: '⚠️',
        style: { backgroundColor: 'var(--color-surface-container-low)' },
      })

      return
    }

    setConfirmDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (isActionPending || selectedItems[activeTab].length === 0) {
      return
    }

    const mutations = {
      books: hardDeleteBooks,
      authors: hardDeleteAuthors,
      orders: showDeletedOrders ? restoreOrders : softDeleteOrders,
      users: showDeletedUsers ? restoreUsers : softDeleteUsers,
    }

    try {
      await mutations[activeTab](selectedItems[activeTab]).unwrap()

      const action = supportsSoftDelete
        ? showDeleted
          ? 'restored'
          : 'removed'
        : 'deleted'
      toast.success(`Successfully ${action} selected ${activeTab}`)
      setSelectedItems({
        orders: [],
        books: [],
        authors: [],
        users: [],
      })
    } catch {
      toast.error(
        `Failed to ${actionLabel.toLowerCase()} selected ${activeTab}`,
      )
    }

    setConfirmDialogOpen(false)
  }

  const renderEditForm = () => {
    switch (activeTab) {
      case 'books':
        return (
          <BookEditForm
            editedItem={getEditedItem<BookWithAuthorId>(editedItem)}
            onClose={handleDialogClose}
            readOnly={!isEditing}
          />
        )
      case 'authors':
        return (
          <AuthorEditForm
            editedItem={getEditedItem<Author>(editedItem)}
            onClose={handleDialogClose}
            readOnly={!isEditing}
          />
        )
      case 'orders':
        return (
          <OrderEditForm
            editedItem={getEditedItem<CmsOrder>(editedItem)}
            onClose={handleDialogClose}
            readOnly={!isEditing}
          />
        )
      case 'users':
        return (
          <UserEditForm
            editedItem={getEditedItem<CmsUser>(editedItem)}
            onClose={handleDialogClose}
            readOnly={!isEditing}
          />
        )
      default:
        return null
    }
  }

  return (
    <StyledCMS>
      <ExtraSpace />
      <MainContainer>
        <MenuButtons>
          <Button
            onClick={() => {
              setEditedItem(null)
              setIsEditing(true)
              setIsDialogOpen(true)
            }}
            $size="smMd"
            $color="secondary"
            type="button"
            disabled={
              activeTab === 'orders' ||
              (activeTab === 'users' && showDeletedUsers)
            }>
            Add
          </Button>
          <Button
            onClick={handleBulkActionClick}
            $size="smMd"
            $color={actionColor}
            type="button">
            {actionLabel}
          </Button>
          {supportsSoftDelete && (
            <IconButton
              type="button"
              title={visibilityLabel}
              aria-label={visibilityLabel}
              aria-pressed={showDeleted}
              icon={<VisibilityIcon aria-hidden="true" />}
              onClick={() => {
                if (activeTab === 'orders') {
                  setShowDeletedOrders(!showDeleted)
                } else {
                  setShowDeletedUsers(!showDeleted)
                }

                setSelectedItems((previous) => ({
                  ...previous,
                  [activeTab]: [],
                }))
              }}
            />
          )}
          <Button
            onClick={() => void navigate('/')}
            $icon={<LogoutIcon />}
            $iconPos="right"
            $size="smMd"
            $inverted
            type="button"
            style={{ marginLeft: 'auto' }}>
            {userData?.firstName}
          </Button>
        </MenuButtons>
        <StyledTabs>
          {TABS.map((tab) => (
            <NavLink to={`/cms/${tab.value}`} key={tab.value}>
              {tab.label}
            </NavLink>
          ))}
        </StyledTabs>
        <Outlet
          context={{
            showDeletedOrders,
            showDeletedUsers,
            selectedItems,
            setSelectedItems,
            setIsDialogOpen,
            setIsEditing,
            setEditedItem,
          }}
        />
      </MainContainer>
      {isDialogOpen && (
        <StyledEditDialog ref={dialogRef} onCancel={handleDialogClose}>
          {renderEditForm()}
        </StyledEditDialog>
      )}
      <ConfirmDialog
        ref={confirmRef}
        isDialogOpen={isConfirmDialogOpen}
        setIsDialogOpen={setConfirmDialogOpen}
        handleConfirm={() => void handleConfirmAction()}
        message={confirmationMessage}
        buttonText={actionLabel}
        buttonColor={actionColor}
        isLoading={isActionPending}
      />
    </StyledCMS>
  )
}
