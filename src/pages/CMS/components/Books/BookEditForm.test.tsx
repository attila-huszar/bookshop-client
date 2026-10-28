import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authorsApi } from '@/store/api/authorsApi'
import { useAddBookMutation, useUpdateBookMutation } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import type { BookWithAuthorId } from '@/types'
import { BookEditForm } from './BookEditForm'

vi.mock('@/store/api/booksApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/api/booksApi')>()),
  useAddBookMutation: vi.fn(),
  useUpdateBookMutation: vi.fn(),
}))

const book: BookWithAuthorId = {
  id: 42,
  title: 'Example book',
  authorId: 1,
  genre: 'Fiction',
  imgUrl: 'https://example.com/book.jpg',
  description: 'An example book description',
  publishYear: 2000,
  rating: 5,
  price: 10,
  discount: 0,
  discountPrice: 10,
  topSellers: false,
  newRelease: false,
  createdAt: '2026-10-01T10:00:00Z',
  updatedAt: '2026-10-01T10:00:00Z',
}

let store: ReturnType<typeof createAppStore>

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
})

describe('BookEditForm', () => {
  const addBook = vi.fn()
  const updateBook = vi.fn()

  beforeEach(async () => {
    store = createAppStore()
    addBook.mockReturnValue({ unwrap: () => Promise.resolve(book) })
    updateBook.mockReturnValue({ unwrap: () => Promise.resolve(book) })
    vi.mocked(useAddBookMutation).mockReturnValue([addBook, { reset: vi.fn() }])
    vi.mocked(useUpdateBookMutation).mockReturnValue([
      updateBook,
      { reset: vi.fn() },
    ])
    await store.dispatch(
      authorsApi.util.upsertQueryData(
        'cmsAuthors',
        undefined,
        ['First author', 'Second author'].map((name, index) => ({
          id: index + 1,
          name,
          fullName: name,
          birthYear: '1980',
          deathYear: '',
          homeland: '',
          biography: '',
        })),
      ),
    )
  })

  it.each([false, true])(
    'submits the displayed discount price and numeric author ID without metadata (editing: %s)',
    async (editing) => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(
        <Provider store={store}>
          <MemoryRouter>
            <BookEditForm
              editedItem={editing ? book : null}
              onClose={onClose}
            />
          </MemoryRouter>
        </Provider>,
      )

      expect(screen.getByRole('combobox')).toHaveValue(editing ? '1' : '0')

      if (!editing) {
        for (const [placeholder, value] of [
          ['Title', book.title],
          ['Genre', book.genre],
          ['Description', book.description],
          ['Image URL', book.imgUrl],
        ] as const) {
          await user.click(screen.getByPlaceholderText(placeholder))
          await user.paste(value)
        }
      }

      await user.selectOptions(screen.getByRole('combobox'), '2')

      for (const [placeholder, value] of [
        ['Price', '20'],
        ['Discount', '25'],
      ] as const) {
        const input = screen.getByPlaceholderText(placeholder)
        await user.clear(input)
        await user.type(input, value)
      }

      expect(
        screen.getByRole('spinbutton', { name: 'Discount Price' }),
      ).toHaveValue(15)

      await user.click(screen.getByRole('button', { name: /Save/ }))

      const expected = {
        title: book.title,
        authorId: 2,
        genre: book.genre,
        imgUrl: book.imgUrl,
        description: book.description,
        publishYear: 2000,
        rating: 5,
        price: 20,
        discount: 25,
        discountPrice: 15,
        topSellers: false,
        newRelease: false,
      }

      await waitFor(() => {
        expect(editing ? updateBook : addBook).toHaveBeenCalledWith(
          editing ? { ...expected, id: book.id } : expected,
        )
      })
      expect(editing ? addBook : updateBook).not.toHaveBeenCalled()
      expect(onClose).toHaveBeenCalledOnce()
      expect(book.discountPrice).toBe(10)
    },
  )
})
