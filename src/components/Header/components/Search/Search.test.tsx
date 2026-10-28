import { useNavigate } from 'react-router'
import { Providers } from '@/testUtils'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ky from 'ky'
import { vi } from 'vitest'
import * as publicApi from '@/api/baseRequest'
import { authorsApi } from '@/store/api/authorsApi'
import { booksApi } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import { useAppDispatch } from '@/hooks/redux'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import { Search } from './Search'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: vi.fn(),
}))

vi.mock('@/hooks/useDebouncedCallback', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useDebouncedCallback')>()),
  useDebouncedCallback: vi.fn(),
}))

vi.mock('@/hooks/redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/redux')>()),
  useAppDispatch: vi.fn(),
}))

const httpResponse = (data: unknown) =>
  ky.get('https://bookshop.test/mock', {
    retry: 0,
    fetch: () =>
      Promise.resolve(
        new Response(JSON.stringify(data), {
          headers: { 'content-type': 'application/json' },
        }),
      ),
  })

const pendingHttpResponse = (
  signal: AbortSignal | null | undefined,
  httpSignals: AbortSignal[],
) =>
  ky.get('https://bookshop.test/mock', {
    retry: 0,
    signal,
    fetch: (request) => {
      const requestSignal = request.signal
      httpSignals.push(requestSignal)

      return new Promise<Response>((_resolve, reject) => {
        requestSignal.addEventListener(
          'abort',
          () => reject(new DOMException('Request aborted', 'AbortError')),
          { once: true },
        )
      })
    },
  })

describe('Search', () => {
  const mockNavigate = vi.fn()
  let store: ReturnType<typeof createAppStore>

  beforeEach(() => {
    store = createAppStore()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(useDebouncedCallback).mockImplementation((fn) => fn)
    vi.mocked(useAppDispatch).mockReturnValue(store.dispatch)
  })

  afterEach(() => {
    store.dispatch(bookshopApi.util.resetApiState())
    vi.restoreAllMocks()
  })

  it('queries books and authors and navigates to the selected result', async () => {
    const get = vi.spyOn(publicApi, 'baseRequest').mockImplementation((url) =>
      httpResponse(
        url === 'books'
          ? [
              {
                id: 1,
                title: 'Test Title',
                author: 'Test Author',
                imgUrl: 'test.jpg',
              },
            ]
          : [],
      ),
    )

    render(<Search />, { wrapper: Providers })

    await userEvent.click(screen.getByRole('textbox', { name: 'Search' }))
    await userEvent.paste('Test')

    expect(await screen.findByText('Test Title')).toBeInTheDocument()
    expect(get).toHaveBeenCalledWith(
      'books',
      expect.objectContaining({
        searchParams: { title: 'Test' },
      }),
    )
    expect(get).toHaveBeenCalledWith(
      'authors',
      expect.objectContaining({
        searchParams: { name: 'Test' },
      }),
    )

    expect(screen.getByRole('link', { name: /Test Title/ })).toHaveAttribute(
      'href',
      '/book?id=1',
    )
    await userEvent.click(screen.getByTitle('Search'))
    expect(mockNavigate).toHaveBeenCalledWith('/book?id=1')
  })

  it('merges author matches without mutating cached book results', async () => {
    const book = {
      id: 1,
      title: 'First Book',
      author: 'Author',
      imgUrl: 'test.jpg',
    }
    const anotherBook = { ...book, id: 2, title: 'Second Book' }

    vi.spyOn(publicApi, 'baseRequest').mockImplementation((url, options) => {
      if (url === 'authors') {
        return httpResponse([{ id: 7, name: 'Author' }])
      }

      return httpResponse(
        typeof options?.searchParams === 'object' &&
          'authorId' in options.searchParams
          ? [book, anotherBook]
          : [book],
      )
    })

    render(<Search />, { wrapper: Providers })

    await userEvent.click(screen.getByRole('textbox', { name: 'Search' }))
    await userEvent.paste('Author')

    expect(await screen.findByText('Second Book')).toBeInTheDocument()
    expect(screen.getAllByText('First Book')).toHaveLength(1)
    await waitFor(() => {
      expect(
        booksApi.endpoints.bookSearch.select('Author')(store.getState()).data,
      ).toEqual([book])
    })
  })

  it('shows pending search state and ignores results after the search is cleared', async () => {
    let completeRequest!: () => void
    const pending = new Promise<void>((resolve) => {
      completeRequest = resolve
    })
    vi.spyOn(publicApi, 'baseRequest').mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: async () => {
          await pending

          return new Response('[]', {
            headers: { 'content-type': 'application/json' },
          })
        },
      }),
    )

    render(<Search />, { wrapper: Providers })
    await userEvent.click(screen.getByRole('textbox', { name: 'Search' }))
    await userEvent.paste('Test')

    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute(
      'aria-busy',
      'true',
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText('No search results...')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTitle('Clear'))
    await act(async () => {
      completeRequest()
      await store.dispatch(
        booksApi.endpoints.bookSearch.initiate('Test', { subscribe: false }),
      )
      await store.dispatch(
        authorsApi.endpoints.authorSearch.initiate('Test', {
          subscribe: false,
        }),
      )
    })

    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('')
    expect(screen.getByText('No search results...')).not.toBeVisible()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows a failed search instead of reporting no results', async () => {
    vi.spyOn(publicApi, 'baseRequest').mockRejectedValue(
      new Error('Network unavailable'),
    )
    render(<Search />, { wrapper: Providers })

    await userEvent.click(screen.getByRole('textbox', { name: 'Search' }))
    await userEvent.paste('Test')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load search results. Please try again.',
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText('No search results...')).not.toBeInTheDocument()
  })

  it.each(['clear', 'replace', 'unmount'] as const)(
    'aborts pending HTTP requests when the search is %s',
    async (action) => {
      const httpSignals: AbortSignal[] = []
      vi.spyOn(publicApi, 'baseRequest').mockImplementation((_url, options) =>
        pendingHttpResponse(options?.signal, httpSignals),
      )
      const { unmount } = render(<Search />, { wrapper: Providers })
      const input = screen.getByRole('textbox', { name: 'Search' })
      fireEvent.change(input, { target: { value: 'Test' } })

      await waitFor(() => expect(httpSignals).toHaveLength(2))
      const previousSignals = [...httpSignals]

      if (action === 'clear') {
        await userEvent.click(screen.getByTitle('Clear'))
      } else if (action === 'replace') {
        fireEvent.change(input, { target: { value: 'Other' } })
      } else {
        unmount()
      }

      expect(previousSignals.every((signal) => signal.aborted)).toBe(true)
      await waitFor(() => {
        expect(
          booksApi.endpoints.bookSearch.select('Test')(store.getState())
            .isError,
        ).toBe(true)
        expect(
          authorsApi.endpoints.authorSearch.select('Test')(store.getState())
            .isError,
        ).toBe(true)
      })
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()

      await waitFor(() =>
        expect(httpSignals).toHaveLength(action === 'replace' ? 4 : 2),
      )
      expect(httpSignals.slice(2).every((signal) => !signal.aborted)).toBe(true)
      expect(
        screen
          .queryByRole('button', { name: 'Search' })
          ?.getAttribute('aria-busy') === 'true',
      ).toBe(action === 'replace')
      unmount()
    },
  )

  it('also aborts pending books-by-author requests when cleared', async () => {
    const httpSignals: AbortSignal[] = []
    vi.spyOn(publicApi, 'baseRequest').mockImplementation((url, options) => {
      if (url === 'authors') {
        return httpResponse([{ id: 7, name: 'Author' }])
      }

      if (
        typeof options?.searchParams === 'object' &&
        'authorId' in options.searchParams
      ) {
        return pendingHttpResponse(options.signal, httpSignals)
      }

      return httpResponse([])
    })
    render(<Search />, { wrapper: Providers })
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), {
      target: { value: 'Author' },
    })

    await waitFor(() => expect(httpSignals).toHaveLength(1))
    await userEvent.click(screen.getByTitle('Clear'))

    expect(httpSignals[0]?.aborted).toBe(true)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('does not abort a matching query already started by another consumer', async () => {
    const httpSignals: AbortSignal[] = []
    vi.spyOn(publicApi, 'baseRequest').mockImplementation((_url, options) =>
      pendingHttpResponse(options?.signal, httpSignals),
    )
    const existingRequest = store.dispatch(
      booksApi.endpoints.bookSearch.initiate('Test', { subscribe: false }),
    )
    await waitFor(() => expect(httpSignals).toHaveLength(1))
    render(<Search />, { wrapper: Providers })
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), {
      target: { value: 'Test' },
    })
    await waitFor(() => expect(httpSignals).toHaveLength(2))

    await userEvent.click(screen.getByTitle('Clear'))

    expect(httpSignals[0]?.aborted).toBe(false)
    expect(httpSignals[1]?.aborted).toBe(true)
    await act(async () => {
      existingRequest.abort()
      await existingRequest
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
