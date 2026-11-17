import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router'
import { ROUTE } from '@/routes/route'
import { Button, IconButton } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ExtraSpace } from '@/components/Header'
import { useCMS } from '@/hooks/useCMS'
import {
  type Author,
  type BookWithAuthorId,
  type CmsOrder,
  CmsTab,
  type CmsUser,
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
import { TABS } from './CMS.config'
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

export const CMS = () => {
  const { t } = useTranslation()
  const [termsSettingsOpen, setTermsSettingsOpen] = useState(false)
  const {
    tab,
    dialogRef,
    confirmRef,
    editor,
    bulkAction,
    visibility,
    confirmation,
    outletContext,
  } = useCMS()

  const VisibilityIcon =
    tab.value === CmsTab.Orders
      ? visibility.showDeleted
        ? StoreIcon
        : StoreSlashIcon
      : visibility.showDeleted
        ? UserIcon
        : UserSlashIcon

  const renderEditForm = () => {
    switch (tab.value) {
      case CmsTab.Books:
        return (
          <BookEditForm
            editedItem={editor.item as BookWithAuthorId | null}
            onClose={editor.onClose}
            readOnly={editor.readOnly}
          />
        )
      case CmsTab.Authors:
        return (
          <AuthorEditForm
            editedItem={editor.item as Author | null}
            onClose={editor.onClose}
            readOnly={editor.readOnly}
          />
        )
      case CmsTab.Orders:
        return (
          <OrderEditForm
            editedItem={editor.item as CmsOrder | null}
            onClose={editor.onClose}
            readOnly={editor.readOnly}
          />
        )
      case CmsTab.Users:
        return (
          <UserEditForm
            editedItem={editor.item as CmsUser | null}
            onClose={editor.onClose}
            readOnly={editor.readOnly}
          />
        )
    }
  }

  return (
    <StyledCMS>
      <ExtraSpace />
      <MainContainer>
        <MenuButtons>
          <Button
            onClick={editor.onAdd}
            $size="smMd"
            $color="secondary"
            type="button"
            disabled={!editor.canAdd}>
            {t('common.actions.add')}
          </Button>
          <Button
            onClick={bulkAction.onClick}
            $size="smMd"
            $color={bulkAction.color}
            type="button">
            {bulkAction.label}
          </Button>
          {visibility.canToggle && (
            <IconButton
              type="button"
              title={visibility.label}
              aria-label={visibility.label}
              aria-pressed={visibility.showDeleted}
              icon={<VisibilityIcon aria-hidden="true" />}
              onClick={visibility.onToggle}
            />
          )}
          <CMSMenu onOpenTerms={() => setTermsSettingsOpen(true)} />
        </MenuButtons>
        <StyledTabs>
          {TABS.map((tab) => (
            <NavLink to={`/${ROUTE.CMS}/${tab.value}`} key={tab.value}>
              {t(tab.entity, { count: 2 })}
            </NavLink>
          ))}
        </StyledTabs>
        <Outlet context={outletContext} />
      </MainContainer>
      {termsSettingsOpen && (
        <TermsSettingsDialog onClose={() => setTermsSettingsOpen(false)} />
      )}
      {editor.isOpen && (
        <StyledEditDialog
          ref={dialogRef}
          aria-labelledby="cms-record-title"
          onCancel={editor.onClose}>
          <DialogHeader>
            <h2 id="cms-record-title">
              {t('cms.information', {
                entity: t(tab.entity, { count: 1 }),
              })}
            </h2>
            <DialogCloseButton
              type="button"
              aria-label={t('common.actions.close')}
              title={t('common.actions.close')}
              icon={<XIcon aria-hidden="true" />}
              onClick={editor.onClose}
            />
          </DialogHeader>
          <DialogBody>{renderEditForm()}</DialogBody>
        </StyledEditDialog>
      )}
      <ConfirmDialog ref={confirmRef} {...confirmation} />
    </StyledCMS>
  )
}
