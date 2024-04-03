import axios from 'axios'
import { AppDispatch } from './store'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { booksSuccess, booksError } from './booksSlice'
import { authorsSuccess, authorsError } from './authorsSlice'

const URL: Record<string, string> = {
  books: import.meta.env.VITE_BASE_URL + '/books',
  authors: import.meta.env.VITE_BASE_URL + '/authors',
}

const actions: Record<string, BooksActions | AuthorsActions> = {
  books: {
    success: booksSuccess,
    error: booksError,
  },
  authors: {
    success: authorsSuccess,
    error: authorsError,
  },
}

const fetchUrl =
  (url: string, actions: BooksActions | AuthorsActions) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      const response = await axios.get(url)
      dispatch(actions.success(response.data))
    } catch (error) {
      dispatch(actions.error(error))
    }
  }

export const getData =
  (type: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    await fetchUrl(URL[type], actions[type])(dispatch)
  }

type ActionCreator<T> = {
  success: ActionCreatorWithPayload<T, string>
  error: ActionCreatorWithPayload<T, string>
}

type BooksActions = ActionCreator<unknown>
type AuthorsActions = ActionCreator<unknown>
