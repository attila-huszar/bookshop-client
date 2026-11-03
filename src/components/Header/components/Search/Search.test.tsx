import { useNavigate } from 'react-router'
import { Providers } from '@/testUtils'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ky from 'ky'
import { vi } from 'vitest'
import * as publicApi from '@/api/baseRequest'
import { booksApi } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import { useAppDispatch } from '@/hooks/redux'
import { Search } from './Search'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: vi.fn(),
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
    vi.mocked(useAppDispatch).mockReturnValue(store.dispatch)
  })

  afterEach(() => {
    store.dispatch(bookshopApi.util.resetApiState())
    vi.restoreAllMocks()
  })

  it('queries combined search once and navigates to the selected result', async () => {
    const get = vi.spyOn(publicApi, 'baseRequest').mockImplementation(() =>
      httpResponse([
        {
          id: 1,
          title: 'Test Title',
          author: 'Test Author',
          imgUrl: 'test.jpg',
        },
      ]),
    )

    render(<Search />, { wrapper: Providers })

    await userEvent.click(screen.getByRole('textbox', { name: 'Search' }))
    await userEvent.paste('Test')

    expect(await screen.findByText('Test Title')).toBeInTheDocument()
    expect(get).toHaveBeenCalledWith(
      'books/search',
      expect.objectContaining({
        searchParams: { q: 'Test' },
      }),
    )
    expect(get).toHaveBeenCalledTimes(1)

    expect(screen.getByRole('link', { name: /Test Title/ })).toHaveAttribute(
      'href',
      '/book?id=1',
    )
    await userEvent.click(screen.getByTitle('Search'))
    expect(mockNavigate).toHaveBeenCalledWith('/book?id=1')

    await userEvent.click(screen.getByRole('link', { name: /Test Title/ }))
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('')
  })

  it('renders the combined response without mutating the cached results', async () => {
    const book = {
      id: 1,
      title: 'First Book',
      author: 'Author',
      imgUrl: 'test.jpg',
    }
    const anotherBook = { ...book, id: 2, title: 'Second Book' }

    vi.spyOn(publicApi, 'baseRequest').mockImplementation(() =>
      httpResponse([book, anotherBook]),
    )

    render(<Search />, { wrapper: Providers })

    await userEvent.click(screen.getByRole('textbox', { name: 'Search' }))
    await userEvent.paste('Author')

    expect(await screen.findByText('Second Book')).toBeInTheDocument()
    expect(screen.getAllByText('First Book')).toHaveLength(1)
    await waitFor(() => {
      expect(
        booksApi.endpoints.bookSearch.select('Author')(store.getState()).data,
      ).toEqual([book, anotherBook])
    })
  })

  it('shows pending search state and ignores results after the search is cleared', async () => {
    let completeRequest!: () => void
    const pending = new Promise<void>((resolve) => {
      completeRequest = resolve
    })
    const get = vi.spyOn(publicApi, 'baseRequest').mockImplementation(() =>
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
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1))

    await userEvent.click(screen.getByTitle('Clear'))
    await act(async () => {
      completeRequest()
      await store.dispatch(
        booksApi.endpoints.bookSearch.initiate('Test', { subscribe: false }),
      )
    })

    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveFocus()
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

      await waitFor(() => expect(httpSignals).toHaveLength(1))
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
      })
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()

      await waitFor(() =>
        expect(httpSignals).toHaveLength(action === 'replace' ? 2 : 1),
      )
      expect(httpSignals.slice(1).every((signal) => !signal.aborted)).toBe(true)
      expect(
        screen
          .queryByRole('button', { name: 'Search' })
          ?.getAttribute('aria-busy') === 'true',
      ).toBe(action === 'replace')
      unmount()
    },
  )

  it('trims queries and keeps a pending search when only surrounding whitespace changes', async () => {
    const httpSignals: AbortSignal[] = []
    const get = vi
      .spyOn(publicApi, 'baseRequest')
      .mockImplementation((_url, options) =>
        pendingHttpResponse(options?.signal, httpSignals),
      )
    const { unmount } = render(<Search />, { wrapper: Providers })
    const input = screen.getByRole('textbox', { name: 'Search' })
    fireEvent.change(input, { target: { value: '   ' } })
    expect(get).not.toHaveBeenCalled()
    expect(input).toHaveAttribute('aria-busy', 'false')
    fireEvent.change(input, {
      target: { value: ' Author ' },
    })

    await waitFor(() => expect(httpSignals).toHaveLength(1))
    await userEvent.type(input, ' ')

    expect(get).toHaveBeenCalledExactlyOnceWith(
      'books/search',
      expect.objectContaining({
        searchParams: { q: 'Author' },
      }),
    )
    expect(httpSignals[0]?.aborted).toBe(false)
    unmount()
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
    const initiate = vi.spyOn(booksApi.endpoints.bookSearch, 'initiate')
    render(<Search />, { wrapper: Providers })
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), {
      target: { value: 'Test' },
    })
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveAttribute(
      'aria-busy',
      'true',
    )
    await waitFor(() => expect(initiate).toHaveBeenCalledTimes(1))
    expect(httpSignals).toHaveLength(1)

    await userEvent.click(screen.getByTitle('Clear'))

    expect(httpSignals[0]?.aborted).toBe(false)
    await act(async () => {
      existingRequest.abort()
      await existingRequest
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('keeps the dropdown dismissed when a pending response arrives and can reopen empty results', async () => {
    let completeRequest!: (response: Response) => void
    vi.spyOn(publicApi, 'baseRequest').mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () =>
          new Promise<Response>((resolve) => {
            completeRequest = resolve
          }),
      }),
    )
    render(<Search />, { wrapper: Providers })
    const input = screen.getByRole('textbox', { name: 'Search' })
    fireEvent.change(input, { target: { value: 'Missing' } })
    await waitFor(() => expect(completeRequest).toBeDefined())
    fireEvent.pointerDown(document.body)

    await act(async () => {
      completeRequest(
        new Response('[]', {
          headers: { 'content-type': 'application/json' },
        }),
      )
      await store.dispatch(
        booksApi.endpoints.bookSearch.initiate('Missing', { subscribe: false }),
      )
    })

    expect(screen.getByText('No search results...')).not.toBeVisible()
    await userEvent.click(input)
    expect(screen.getByText('No search results...')).toBeVisible()
  })

  it('debounces rapid changes into one request for the latest query', async () => {
    const get = vi
      .spyOn(publicApi, 'baseRequest')
      .mockImplementation(() => httpResponse([]))
    render(<Search />, { wrapper: Providers })
    const input = screen.getByRole('textbox', { name: 'Search' })
    fireEvent.change(input, { target: { value: 'To' } })
    fireEvent.change(input, { target: { value: 'Tolk' } })
    fireEvent.change(input, { target: { value: 'Tolkien' } })

    expect(get).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(get).toHaveBeenCalledExactlyOnceWith(
        'books/search',
        expect.objectContaining({
          searchParams: { q: 'Tolkien' },
        }),
      ),
    )
  })

  it.each(['clear', 'shorten', 'unmount'] as const)(
    'cancels the debounce timer when the search is %s',
    async (action) => {
      vi.useFakeTimers()

      try {
        const get = vi
          .spyOn(publicApi, 'baseRequest')
          .mockImplementation(() => httpResponse([]))
        const { unmount } = render(<Search />, { wrapper: Providers })
        fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), {
          target: { value: 'Test' },
        })

        if (action === 'clear') {
          fireEvent.click(screen.getByTitle('Clear'))
        } else if (action === 'shorten') {
          fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), {
            target: { value: 'T' },
          })
        } else {
          unmount()
        }

        await act(async () => {
          await vi.advanceTimersByTimeAsync(300)
        })

        expect(get).not.toHaveBeenCalled()
        unmount()
      } finally {
        vi.useRealTimers()
      }
    },
  )
})
