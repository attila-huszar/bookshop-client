import type { Dispatch, SetStateAction } from 'react'
import type { Author } from './Author'
import type { BookWithAuthorId } from './Book'
import type { CmsOrder } from './Order'
import type { CmsUser } from './User'

export const enum CmsTab {
  Orders = 'orders',
  Books = 'books',
  Authors = 'authors',
  Users = 'users',
}

export type CmsEditedItem = BookWithAuthorId | Author | CmsOrder | CmsUser

export type CMSOutletContext = {
  showDeletedOrders: boolean
  showDeletedUsers: boolean
  selectedItems: SelectContext
  setSelectedItems: Dispatch<SetStateAction<SelectContext>>
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsEditing: Dispatch<SetStateAction<boolean>>
  setEditedItem: Dispatch<SetStateAction<CmsEditedItem | null>>
}

export type SelectContext = Record<CmsTab, number[]>
