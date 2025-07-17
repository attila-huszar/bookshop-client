import { useRef, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router'
import { AsyncThunkAction } from '@reduxjs/toolkit'
import { Button, ConfirmDialog, ExtraSpace } from '@/components'
import { Details, Tabs } from './components'
import { StyledCMS, MainContainer, MenuButtons } from './CMS.style'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { CMSContext } from './CMS.types'
import { LogoutIcon } from '@/assets/svg'
import { AppDispatch, delBooks, RootState } from '@/store'
import toast from 'react-hot-toast'

export const CMS = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { userData } = useAppSelector((state) => state.user)
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [selectedItems, setSelectedItems] = useState<CMSContext>({
    orders: [],
    books: [],
    authors: [],
    users: [],
  })
  const ref = useRef<HTMLDialogElement>(null)

  const activeTab = location.pathname.split('/').pop() as keyof typeof actionMap

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

  const handleConfirm = async () => {
    const action = actionMap[activeTab]
    if (!action) return
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

    setIsDialogOpen(false)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
  }

  return (
    <StyledCMS>
      <ExtraSpace />
      <MainContainer>
        <MenuButtons>
          <Button
            onClick={() => setIsDetailsOpen((prev) => !prev)}
            $size="smMd"
            $color="secondary"
            type="button">
            Add
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
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
        {isDetailsOpen && <Details setIsDetailsOpen={setIsDetailsOpen} />}
        <Outlet context={{ selectedItems, setSelectedItems }} />
      </MainContainer>
      <ConfirmDialog
        ref={ref}
        isDialogOpen={isDialogOpen}
        handleConfirm={() => void handleConfirm()}
        handleCancel={handleCancel}
        message={`Are you sure you want to delete selected ${activeTab}?`}
        buttonText="Delete"
        buttonColor="danger"
      />
    </StyledCMS>
  )
}
