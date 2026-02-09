import { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AsyncThunkAction } from '@reduxjs/toolkit'
import {
  AppDispatch,
  deleteAuthors,
  deleteBooks,
  deleteOrders,
  deleteUsers,
  RootState,
} from '@/store'
import { Button, ConfirmDialog, ExtraSpace } from '@/components'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { SelectContext } from '@/types'
import { Author, BookWithAuthorId, Order, User } from '@/types'
import { LogoutIcon } from '@/assets/svg'
import { MainContainer, MenuButtons, StyledCMS } from './CMS.style'
import { EditDialog, Tabs } from './components'

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

  const getActiveTab = (pathname: string): keyof SelectContext => {
    const tab = pathname.split('/').pop()
    switch (tab) {
      case 'orders':
      case 'books':
      case 'authors':
      case 'users':
        return tab
      default:
        return 'orders'
    }
  }

  const activeTab = getActiveTab(location.pathname)

  const actionMap: Record<
    keyof SelectContext,
    AsyncThunkAction<
      unknown,
      unknown,
      { state: RootState; dispatch: AppDispatch }
    > | null
  > = {
    orders: deleteOrders(selectedItems.orders),
    books: deleteBooks(selectedItems.books),
    authors: deleteAuthors(selectedItems.authors),
    users: deleteUsers(selectedItems.users),
  }

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
        <Tabs />
        <Outlet
          context={{
            selectedItems,
            setSelectedItems,
            setIsEditDialogOpen,
            editedItem,
            setEditedItem,
          }}
        />
      </MainContainer>
      <EditDialog
        ref={editRef}
        isDialogOpen={isEditDialogOpen}
        setIsDialogOpen={setIsEditDialogOpen}
        activeTab={activeTab}
        editedItem={editedItem}
        setEditedItem={setEditedItem}
      />
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
