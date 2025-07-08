import { Author } from './Author'
import { Book } from './Book'
import { News } from './News'
import { Order } from './Order'
import { User } from './User'

export type CMSBook = Book

export type CMSAuthor = Author

export type CMSOrder = Order & {
  id: number
}

export type CMSUser = User & {
  id: number
  verified: boolean
  createdAt: string
  updatedAt: string
}

export type CMSNews = News
