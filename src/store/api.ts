import axios from 'axios'
import { URL } from '../lib/pathConstants'
import { AppDispatch } from './store'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { booksSuccess, booksError } from './booksSlice'
import { authorsSuccess, authorsError } from './authorsSlice'

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
      dispatch(actions.error((error as Error).message))
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
