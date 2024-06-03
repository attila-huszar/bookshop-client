import { BOOKS, AUTHORS, NEWS, USERS, SEARCHOPTS } from 'routes'
import { cloudName } from 'lib'

export const URL: Record<string, string> = {
  books: `${import.meta.env.VITE_BASE_URL}/${BOOKS}`,
  authors: `${import.meta.env.VITE_BASE_URL}/${AUTHORS}`,
  news: `${import.meta.env.VITE_BASE_URL}/${NEWS}`,
  users: `${import.meta.env.VITE_BASE_URL}/${USERS}`,
  searchOptions: `${import.meta.env.VITE_BASE_URL}/${SEARCHOPTS}`,
  cloudinaryUpload: `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
}
