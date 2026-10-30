import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useLocation } from 'react-router'
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
import { toast } from '@/components/AppToaster'
import { Button, IconButton } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ExtraSpace } from '@/components/Header'
import { useAppDispatch } from '@/hooks/redux'
import { useClickOutside } from '@/hooks/useClickOutside'
import type {
  Author,
  BookWithAuthorId,
  CmsEditedItem,
  CmsOrder,
  CmsUser,
  SelectContext,
} from '@/types'
import {
  StoreIcon,
  StoreSlashIcon,
  UserIcon,
  UserSlashIcon,
  XIcon,
} from '@/assets/svg'
import {
  DialogBody,
  DialogCloseButton,
  DialogHeader,
} from '@/styles/dialog.styles'
import {
  AuthorEditForm,
  BookEditForm,
  OrderEditForm,
  UserEditForm,
} from './components'
import { CMSMenu } from './components/CMSMenu/CMSMenu'
import { TermsSettingsDialog } from './components/TermsSettingsDialog/TermsSettingsDialog'
import {
  MainContainer,
  MenuButtons,
  StyledCMS,
  StyledEditDialog,
  StyledTabs,
} from './styles'

const TABS = [
  { label: 'navigation.orders', value: 'orders' },
  { label: 'catalogue.books', value: 'books' },
  { label: 'cms.authors', value: 'authors' },
  { label: 'cms.users', value: 'users' },
] as const

const ENTITY_LABELS = {
  books: 'catalogue.book',
  authors: 'common.fields.author',
  orders: 'common.fields.order',
  users: 'cms.user',
} as const

export type TabValue = (typeof TABS)[number]['value']

const getEditedItem = <T extends CmsEditedItem>(
  item: CmsEditedItem | null,
): T | null => item as T | null

const isValidTab = (tab: string): tab is TabValue =>
  TABS.some((t) => t.value === tab)

export const CMS = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [termsSettingsOpen, setTermsSettingsOpen] = useState(false)
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
      ? t('common.actions.restore')
      : t('common.actions.remove')
    : t('common.actions.delete')
  const isRestoring = supportsSoftDelete && showDeleted
  const actionColor = isRestoring ? 'secondary' : 'danger'
  const entity = t(
    TABS.find((tab) => tab.value === activeTab)!.label,
  ).toLocaleLowerCase()
  const visibilityLabel = t(
    showDeleted ? 'cms.showActive' : 'cms.showRemoved',
    { entity },
  )
  const VisibilityIcon =
    activeTab === 'orders'
      ? showDeleted
        ? StoreIcon
        : StoreSlashIcon
      : showDeleted
        ? UserIcon
        : UserSlashIcon
  const confirmationMessage = isRestoring
    ? `${t('cms.confirmRestore', { entity })}${activeTab === 'users' ? ` ${t('cms.restoreAccess')}` : ''}`
    : supportsSoftDelete
      ? t('cms.confirmRemove', {
          entity,
          details: t(
            activeTab === 'users'
              ? 'cms.removeUsersDetails'
              : 'cms.removeOrdersDetails',
          ),
        })
      : t('cms.confirmDelete', { entity })

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setIsEditing(false)
    setEditedItem(null)
  }

  useClickOutside(dialogRef, handleDialogClose)

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
      books: hardDeleteBooks,
      authors: hardDeleteAuthors,
      orders: showDeletedOrders ? restoreOrders : softDeleteOrders,
      users: showDeletedUsers ? restoreUsers : softDeleteUsers,
    }

    try {
      await mutations[activeTab](selectedItems[activeTab]).unwrap()

      const action = supportsSoftDelete
        ? showDeleted
          ? t('cms.actions.restored')
          : t('cms.actions.removed')
        : t('cms.actions.deleted')
      toast.success(t('cms.bulkSuccess', { action, entity }))
      setSelectedItems({
        orders: [],
        books: [],
        authors: [],
        users: [],
      })
    } catch {
      toast.error(
        t('cms.bulkError', { action: actionLabel.toLocaleLowerCase(), entity }),
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
            {t('common.actions.add')}
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
                dispatch(setCmsCurrentPage({ tab: activeTab, page: 1 }))
              }}
            />
          )}
          <CMSMenu onOpenTerms={() => setTermsSettingsOpen(true)} />
        </MenuButtons>
        <StyledTabs>
          {TABS.map((tab) => (
            <NavLink to={`/cms/${tab.value}`} key={tab.value}>
              {t(tab.label)}
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
      {termsSettingsOpen && (
        <TermsSettingsDialog onClose={() => setTermsSettingsOpen(false)} />
      )}
      {isDialogOpen && (
        <StyledEditDialog
          ref={dialogRef}
          aria-labelledby="cms-record-title"
          onCancel={handleDialogClose}>
          <DialogHeader>
            <h2 id="cms-record-title">
              {t('cms.information', {
                entity: t(ENTITY_LABELS[activeTab]),
              })}
            </h2>
            <DialogCloseButton
              type="button"
              aria-label={t('common.actions.close')}
              title={t('common.actions.close')}
              icon={<XIcon aria-hidden="true" />}
              onClick={handleDialogClose}
            />
          </DialogHeader>
          <DialogBody>{renderEditForm()}</DialogBody>
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
