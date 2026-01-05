import { Author, BookWithAuthorId, Order, User } from './'

export type CMSOutletContext = {
  selectedItems: SelectContext
  setSelectedItems: React.Dispatch<React.SetStateAction<SelectContext>>
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setEditedItem: React.Dispatch<
    React.SetStateAction<BookWithAuthorId | Author | Order | User | null>
  >
}

export type SelectContext = {
  books: number[]
  authors: number[]
  orders: number[]
  users: number[]
}
