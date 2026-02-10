import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { deleteAuthors, deleteBooks, deleteOrders, deleteUsers } from '@/store'
import { Button, ConfirmDialog, ExtraSpace } from '@/components'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { SelectContext } from '@/types'
import {
  Author,
  BookWithAuthorId,
  Order,
  User,
  UserWithMetadata,
} from '@/types'
import { LogoutIcon } from '@/assets/svg'
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

const isValidTab = (tab: string): tab is keyof SelectContext =>
  TABS.some((t) => t.value === tab)

export const CMS = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { userData } = useAppSelector((state) => state.user)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false)
  const [selectedItems, setSelectedItems] = useState<SelectContext>({
    orders: [],
    books: [],
    authors: [],
    users: [],
  })
  const [editedItem, setEditedItem] = useState<
    BookWithAuthorId | Author | Order | User | null
  >(null)
  const editRef = useRef<HTMLDialogElement>(null)
  const confirmRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isEditDialogOpen) {
      editRef.current?.showModal()
    } else {
      editRef.current?.close()
    }
  }, [isEditDialogOpen])

  const activeTab = useMemo(() => {
    const tab = location.pathname.split('/').pop()
    if (tab && isValidTab(tab)) {
      return tab
    }
    return 'orders'
  }, [location.pathname])

  const actionMap = useMemo(
    () => ({
      orders: deleteOrders(selectedItems.orders),
      books: deleteBooks(selectedItems.books),
      authors: deleteAuthors(selectedItems.authors),
      users: deleteUsers(selectedItems.users),
    }),
    [selectedItems],
  )

  const handleDeleteClick = () => {
    if (!selectedItems[activeTab].length) {
      toast('No items selected', {
        icon: '⚠️',
        style: { backgroundColor: 'var(--secondary-hover)' },
      })
      return
    }
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    const action = actionMap[activeTab]
    if (!action || selectedItems[activeTab].length === 0) return
    const result = await dispatch(action)

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(`Successfully deleted selected ${activeTab}`)
      setSelectedItems({
        orders: [],
        books: [],
        authors: [],
        users: [],
      })
    } else {
      toast.error(`Failed to delete selected ${activeTab}`)
    }

    setConfirmDialogOpen(false)
  }

  const handleDialogClose = () => {
    setIsEditDialogOpen(false)
    setEditedItem(null)
  }

  return (
    <StyledCMS>
      <ExtraSpace />
      <MainContainer>
        <MenuButtons>
          <Button
            onClick={() => {
              setEditedItem(null)
              setIsEditDialogOpen(true)
            }}
            $size="smMd"
            $color="secondary"
            type="button"
            disabled={activeTab === 'orders'}>
            Add
          </Button>
          <Button
            onClick={handleDeleteClick}
            $size="smMd"
            $color="danger"
            type="button">
            Remove
          </Button>
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
            selectedItems,
            setSelectedItems,
            setIsEditDialogOpen,
            setEditedItem,
          }}
        />
      </MainContainer>
      {isEditDialogOpen && (
        <StyledEditDialog
          ref={editRef}
          onCancel={() => setIsEditDialogOpen(false)}>
          {activeTab === 'books' && (
            <BookEditForm
              editedItem={editedItem as BookWithAuthorId | null}
              onClose={handleDialogClose}
            />
          )}
          {activeTab === 'authors' && (
            <AuthorEditForm
              editedItem={editedItem as Author | null}
              onClose={handleDialogClose}
            />
          )}
          {activeTab === 'orders' && (
            <OrderEditForm
              editedItem={editedItem as Order | null}
              onClose={handleDialogClose}
            />
          )}
          {activeTab === 'users' && (
            <UserEditForm
              editedItem={editedItem as UserWithMetadata | null}
              onClose={handleDialogClose}
            />
          )}
        </StyledEditDialog>
      )}
      <ConfirmDialog
        ref={confirmRef}
        isDialogOpen={isConfirmDialogOpen}
        setIsDialogOpen={setConfirmDialogOpen}
        handleConfirm={() => void handleConfirmDelete()}
        message={`Are you sure you want to delete selected ${activeTab}?`}
        buttonText="Delete"
        buttonColor="danger"
      />
    </StyledCMS>
  )
}
