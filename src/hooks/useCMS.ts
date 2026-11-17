import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import type { TFunction } from 'i18next'
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

function getBulkAction(showDeleted: boolean, canDelete: boolean): BulkAction {
  if (showDeleted) return BULK_ACTIONS.restore
  if (canDelete) return BULK_ACTIONS.delete
  return BULK_ACTIONS.remove
}

function getConfirmationMessage({
  activeTab,
  showDeleted,
  canDelete,
  entity,
  t,
}: {
  activeTab: CmsTab
  showDeleted: boolean
  canDelete: boolean
  entity: string
  t: TFunction
}): string {
  if (showDeleted) {
    const message = t('cms.confirmRestore', { entity })
    return activeTab === CmsTab.Users
      ? `${message} ${t('cms.restoreAccess')}`
      : message
  }

  if (!canDelete) {
    const detailsKey =
      activeTab === CmsTab.Users
        ? 'cms.removeUsersDetails'
        : 'cms.removeOrdersDetails'

    return t('cms.confirmRemove', { entity, details: t(detailsKey) })
  }

  return t('cms.confirmDelete', { entity })
}

export function useCMS() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { pathname } = useLocation()

  // Active tab
  const routeTab = pathname.split('/').pop()
  const tab = TABS.find((item) => item.value === routeTab) ?? TABS[0]
  const activeTab = tab.value
  const { add: canAdd, delete: canDelete } = tab.actions

  // Mutations
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

  // UI & selection state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [editedItem, setEditedItem] = useState<CmsEditedItem | null>(null)
  const [selectedItems, setSelectedItems] = useState(EMPTY_SELECTION)
  const [showDeletedByTab, setShowDeletedByTab] = useState<
    Partial<Record<CmsTab, boolean>>
  >({
    [CmsTab.Orders]: false,
    [CmsTab.Users]: false,
  })

  const dialogRef = useRef<HTMLDialogElement>(null)
  const confirmRef = useRef<HTMLDialogElement>(null)

  const showDeletedOrders = Boolean(showDeletedByTab[CmsTab.Orders])
  const showDeletedUsers = Boolean(showDeletedByTab[CmsTab.Users])
  const showDeleted = Boolean(showDeletedByTab[activeTab])

  // Derived labels & messages
  const entity = t(tab.entity, { count: 2 }).toLocaleLowerCase()
  const action = getBulkAction(showDeleted, canDelete)
  const actionLabel = t(action.label)
  const visibilityLabel = t(
    showDeleted ? 'cms.showActive' : 'cms.showRemoved',
    { entity },
  )
  const confirmationMessage = getConfirmationMessage({
    activeTab,
    showDeleted,
    canDelete,
    entity,
    t,
  })

  // Dialog effects & handlers
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

  useEffect(() => {
    const dialog = dialogRef.current
    if (!isDialogOpen || !dialog) return

    dialog.showModal()
    dialog.scrollTop = 0
  }, [isDialogOpen])

  // Visibility & bulk action handlers
  const handleVisibilityToggle = () => {
    setShowDeletedByTab((prev) => ({
      ...prev,
      [activeTab]: !prev[activeTab],
    }))
    setSelectedItems((prev) => ({ ...prev, [activeTab]: [] }))
    dispatch(setCmsCurrentPage({ tab: activeTab, page: 1 }))
  }

  const handleBulkActionClick = () => {
    if (selectedItems[activeTab].length === 0) {
      toast(t('cms.noSelection'), {
        icon: '⚠️',
        style: { backgroundColor: 'var(--color-surface-container-low)' },
      })
      return
    }

    setIsConfirmDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    const currentSelection = selectedItems[activeTab]
    if (isActionPending || currentSelection.length === 0) return

    const mutations = {
      [CmsTab.Books]: hardDeleteBooks,
      [CmsTab.Authors]: hardDeleteAuthors,
      [CmsTab.Orders]: showDeletedOrders ? restoreOrders : softDeleteOrders,
      [CmsTab.Users]: showDeletedUsers ? restoreUsers : softDeleteUsers,
    }

    try {
      await mutations[activeTab](currentSelection).unwrap()

      toast.success(
        t('cms.bulkSuccess', {
          action: t(action.success),
          entity,
        }),
      )
      setSelectedItems(EMPTY_SELECTION)
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          t('cms.bulkError', {
            action: actionLabel.toLocaleLowerCase(),
            entity,
          }),
        ),
      )
    } finally {
      setIsConfirmDialogOpen(false)
    }
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
      setIsDialogOpen: setIsConfirmDialogOpen,
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
