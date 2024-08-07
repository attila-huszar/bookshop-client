import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import {
  AppDispatch,
  RootState,
  fetchBooks,
  fetchBookById,
  fetchBooksByProperty,
  fetchBooksBySearch,
  fetchBooksByAuthor,
  fetchAuthorById,
  fetchRecommendedBooks,
} from 'store'
import {
  cartAdd,
  cartRemove,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartClear,
} from './cartSlice'
import { IBook, ICart, ILocalCart } from 'interfaces'

export const authorFetchMiddleware = createListenerMiddleware()

const authorFetchMiddlewareTyped =
  authorFetchMiddleware.startListening.withTypes<RootState, AppDispatch>()

authorFetchMiddlewareTyped({
  matcher: isAnyOf(
    fetchBooks.fulfilled,
    fetchBookById.fulfilled,
    fetchBooksByProperty.fulfilled,
    fetchBooksBySearch.fulfilled,
    fetchBooksByAuthor.fulfilled,
    fetchRecommendedBooks.fulfilled,
  ),
  effect: (action, listenerApi) => {
    if (action.type === fetchBooks.fulfilled.type) {
      const booksFetchPayload = action.payload as { books: IBook[] }
      booksFetchPayload.books.forEach((book) => {
        listenerApi.dispatch(fetchAuthorById(book.author))
      })
    } else if (action.type === fetchBookById.fulfilled.type) {
      const bookFetchByIdPayload = action.payload as IBook
      listenerApi.dispatch(fetchAuthorById(bookFetchByIdPayload.author))
    } else {
      const booksFetchByPropsPayload = action.payload as IBook[]
      booksFetchByPropsPayload.forEach((book) => {
        listenerApi.dispatch(fetchAuthorById(book.author))
      })
    }
  },
})

export const localStorageMiddleware = createListenerMiddleware()

const localStorageMiddlewareTyped =
  localStorageMiddleware.startListening.withTypes<RootState, AppDispatch>()

localStorageMiddlewareTyped({
  matcher: isAnyOf(
    cartAdd,
    cartRemove,
    cartQuantityAdd,
    cartQuantityRemove,
    cartQuantitySet,
    cartClear,
  ),
  effect: (action) => {
    const cartFromLocalStorage: ILocalCart[] = JSON.parse(
      localStorage.getItem('cart') || '[]',
    )

    let cartToLocalStorage: ILocalCart[] = []
    const actionPayload = action.payload as ICart
    const { cartItem, newQuantity } = actionPayload as unknown as {
      cartItem: ICart
      newQuantity: number
    }

    switch (action.type) {
      case cartAdd.type:
        cartToLocalStorage = [
          ...cartFromLocalStorage,
          { id: actionPayload.id, quantity: 1 },
        ]
        break
      case cartRemove.type:
        cartToLocalStorage = cartFromLocalStorage.filter(
          (item) => item.id !== actionPayload.id,
        )
        break
      case cartQuantityAdd.type:
        cartToLocalStorage = cartFromLocalStorage.map((item) =>
          item.id === actionPayload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
        break
      case cartQuantityRemove.type:
        cartToLocalStorage = cartFromLocalStorage.map((item) =>
          item.id === actionPayload.id
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        break
      case cartQuantitySet.type:
        cartToLocalStorage = cartFromLocalStorage.map((item) =>
          item.id === cartItem.id ? { ...item, quantity: newQuantity } : item,
        )
        break
      case cartClear.type:
        localStorage.removeItem('cart')
        break
      default:
        break
    }

    localStorage.setItem('cart', JSON.stringify(cartToLocalStorage))
  },
})
