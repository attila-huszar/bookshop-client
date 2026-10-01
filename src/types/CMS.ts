import type { Author } from './Author'
import type { BookWithAuthorId } from './Book'
import type { Order } from './Order'
import type { UserWithMetadata } from './User'

export type CMSOutletContext = {
  selectedItems: SelectContext
  setSelectedItems: React.Dispatch<React.SetStateAction<SelectContext>>
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  setEditedItem: React.Dispatch<
    React.SetStateAction<
      BookWithAuthorId | Author | Order | UserWithMetadata | null
    >
  >
}

export type SelectContext = {
  books: number[]
  authors: number[]
  orders: number[]
  users: number[]
}
