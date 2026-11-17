import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { useHardDeleteAuthorsMutation } from '@/store/api/authorsApi'
import { useHardDeleteBooksMutation } from '@/store/api/booksApi'
import {
  useRestoreOrdersMutation,
  useSoftDeleteOrdersMutation,
} from '@/store/api/ordersApi'
import {
  useRestoreUsersMutation,
  useSoftDeleteUsersMutation,
} from '@/store/api/usersApi'
import { setCmsCurrentPage } from '@/store/slices/cms'
import {
  BULK_ACTIONS,
  type BulkAction,
  EMPTY_SELECTION,
  TABS,
} from '@/pages/CMS/CMS.config'
import { toast } from '@/components/AppToaster'
import { getErrorMessage } from '@/helpers/errors'
import { type CmsEditedItem, type CMSOutletContext, CmsTab } from '@/types'
import { useAppDispatch } from './redux'
import { useClickOutside } from './useClickOutside'

export function useCMS() {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const location = useLocation()
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeletedOrders, setShowDeletedOrders] = useState(false)
  const [showDeletedUsers, setShowDeletedUsers] = useState(false)
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState(EMPTY_SELECTION)
  const [editedItem, setEditedItem] = useState<CmsEditedItem | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const confirmRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (dialog) {
      dialog.showModal()
      dialog.scrollTop = 0
    }
  }, [isDialogOpen])

  const routeTab = location.pathname.split('/').pop()
  const tab = TABS.find((tab) => tab.value === routeTab) ?? TABS[0]

  const activeTab = tab.value

  let showDeleted = false

  if (activeTab === CmsTab.Orders) {
    showDeleted = showDeletedOrders
  } else if (activeTab === CmsTab.Users) {
    showDeleted = showDeletedUsers
  }

  const canAdd = tab.actions.add
  const canDelete = tab.actions.delete

  let action: BulkAction

  if (showDeleted) {
    action = BULK_ACTIONS.restore
  } else if (canDelete) {
    action = BULK_ACTIONS.delete
  } else {
    action = BULK_ACTIONS.remove
  }

  const actionLabel = t(action.label)

  const entity = t(tab.entity, { count: 2 }).toLocaleLowerCase()
  const visibilityLabel = t(
    showDeleted ? 'cms.showActive' : 'cms.showRemoved',
    { entity },
  )

  let confirmationMessage: string

  if (showDeleted) {
    confirmationMessage = t('cms.confirmRestore', { entity })

    if (activeTab === CmsTab.Users) {
      confirmationMessage += ` ${t('cms.restoreAccess')}`
    }
  } else if (!canDelete) {
    confirmationMessage = t('cms.confirmRemove', {
      entity,
      details: t(
        activeTab === CmsTab.Users
          ? 'cms.removeUsersDetails'
          : 'cms.removeOrdersDetails',
      ),
    })
  } else {
    confirmationMessage = t('cms.confirmDelete', { entity })
  }

  const handleAdd = () => {
    setEditedItem(null)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setIsEditing(false)
    setEditedItem(null)
  }

  useClickOutside(dialogRef, handleDialogClose)

  const handleVisibilityToggle = () => {
    if (activeTab === CmsTab.Orders) {
      setShowDeletedOrders(!showDeleted)
    } else {
      setShowDeletedUsers(!showDeleted)
    }

    setSelectedItems((previous) => ({ ...previous, [activeTab]: [] }))
    dispatch(setCmsCurrentPage({ tab: activeTab, page: 1 }))
  }

  const handleBulkActionClick = () => {
    if (!selectedItems[activeTab].length) {
      toast(t('cms.noSelection'), {
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
      [CmsTab.Books]: hardDeleteBooks,
      [CmsTab.Authors]: hardDeleteAuthors,
      [CmsTab.Orders]: showDeletedOrders ? restoreOrders : softDeleteOrders,
      [CmsTab.Users]: showDeletedUsers ? restoreUsers : softDeleteUsers,
    }

    try {
      await mutations[activeTab](selectedItems[activeTab]).unwrap()

      toast.success(
        i18n.t('cms.bulkSuccess', {
          action: i18n.t(action.success),
          entity: i18n.t(tab.entity, { count: 2 }).toLocaleLowerCase(),
        }),
      )
      setSelectedItems(EMPTY_SELECTION)
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          i18n.t('cms.bulkError', {
            action: i18n.t(action.label).toLocaleLowerCase(),
            entity: i18n.t(tab.entity, { count: 2 }).toLocaleLowerCase(),
          }),
        ),
      )
    }

    setConfirmDialogOpen(false)
  }

  return {
    tab,
    dialogRef,
    confirmRef,
    editor: {
      isOpen: isDialogOpen,
      readOnly: !isEditing,
      item: editedItem,
      canAdd,
      onAdd: handleAdd,
      onClose: handleDialogClose,
    },
    bulkAction: {
      label: actionLabel,
      color: action.color,
      onClick: handleBulkActionClick,
    },
    visibility: {
      canToggle: !canDelete,
      showDeleted,
      label: visibilityLabel,
      onToggle: handleVisibilityToggle,
    },
    confirmation: {
      isDialogOpen: isConfirmDialogOpen,
      setIsDialogOpen: setConfirmDialogOpen,
      handleConfirm: () => void handleConfirmAction(),
      message: confirmationMessage,
      buttonText: actionLabel,
      buttonColor: action.color,
      isLoading: isActionPending,
    },
    outletContext: {
      showDeletedOrders,
      showDeletedUsers,
      selectedItems,
      setSelectedItems,
      setIsDialogOpen,
      setIsEditing,
      setEditedItem,
    } satisfies CMSOutletContext,
  }
}
