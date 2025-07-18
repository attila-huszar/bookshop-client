import { useRef, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router'
import { AsyncThunkAction } from '@reduxjs/toolkit'
import { toast } from 'react-hot-toast'
import { Button, ConfirmDialog, ExtraSpace } from '@/components'
import { EditDialog, Tabs } from './components'
import { StyledCMS, MainContainer, MenuButtons } from './CMS.style'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { CMSContext } from './CMS.types'
import { LogoutIcon } from '@/assets/svg'
import { AppDispatch, delBooks, RootState } from '@/store'

export const CMS = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { userData } = useAppSelector((state) => state.user)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false)
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false)
  const [selectedItems, setSelectedItems] = useState<CMSContext>({
    orders: [],
    books: [],
    authors: [],
    users: [],
  })
  const detailsRef = useRef<HTMLDialogElement>(null)
  const confirmRef = useRef<HTMLDialogElement>(null)

  const getActiveTab = (pathname: string): keyof CMSContext => {
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
    keyof CMSContext,
    AsyncThunkAction<
      unknown,
      unknown,
      { state: RootState; dispatch: AppDispatch }
    > | null
  > = {
    orders: null,
    books: delBooks(selectedItems.books),
    authors: null,
    users: null,
  }

  const checkBeforeDelete = () => {
    if (selectedItems[activeTab].length === 0) {
      toast.error('No items selected for deletion')
      return false
    }
    return true
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
            onClick={() => setIsDetailsDialogOpen((prev) => !prev)}
            $size="smMd"
            $color="secondary"
            type="button">
            Add
          </Button>
          <Button
            onClick={() => {
              if (checkBeforeDelete()) setConfirmDialogOpen(true)
            }}
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
        <Outlet context={{ selectedItems, setSelectedItems }} />
      </MainContainer>
      <EditDialog
        ref={detailsRef}
        isDialogOpen={isDetailsDialogOpen}
        setIsDialogOpen={setIsDetailsDialogOpen}
        activeTab={activeTab}
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
