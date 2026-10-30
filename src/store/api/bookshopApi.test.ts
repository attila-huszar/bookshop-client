import { createElement, type ReactNode } from 'react'
import { Provider, useSelector } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { i18n } from '@/i18n'
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from 'vitest'
import * as privateApi from '@/api/authRequest'
import * as publicApi from '@/api/baseRequest'
import { PATH } from '@/api/path'
import { CheckoutForm } from '@/pages/Checkout/components/CheckoutForm/CheckoutForm'
import { log } from '@/services/logger'
import { getErrorMessage } from '@/helpers/errors'
import type { Book, BookWithAuthorId, Filters } from '@/types'
import { UserRole } from '@/types'
import { booksQueryArgs, userSelector } from '../selectors'
import { applyBooksFilters } from '../slices/books'
import { checkoutReady } from '../slices/payment'
import { authSessionChanged } from '../slices/user'
import { store as appStore, createAppStore, type RootState } from '../store'
import { expireAuthSession, fetchAuthTokens } from '../thunks/user'
import { authorsApi } from './authorsApi'
import { booksApi, useSearchOptionsQuery } from './booksApi'
import { bookshopApi } from './bookshopApi'
import { booksSearchParams, buildBookCriteria } from './booksQuery'
import { ordersApi } from './ordersApi'
import { termsApi } from './termsApi'
import { usersApi, useUserProfileQuery } from './usersApi'

const { confirmPayment } = vi.hoisted(() => ({ confirmPayment: vi.fn() }))

vi.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => ({ confirmPayment }),
  useElements: () => ({}),
  PaymentElement: () => null,
  LinkAuthenticationElement: () => null,
}))

const book: Book = {
  id: 7,
  title: 'Cached book',
  author: 'Author',
  genre: 'Fiction',
  imgUrl: '',
  description: 'A book',
  publishYear: 2024,
  rating: 5,
  price: 10,
  discount: 0,
  discountPrice: 10,
  topSellers: false,
  newRelease: false,
}

const cmsBook: BookWithAuthorId = { ...book, authorId: 1 }

const profile = {
  uuid: '11111111-1111-4111-8111-111111111111',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  country: 'us',
  phone: null,
  address: null,
  avatar: null,
  role: UserRole.User,
}
const fields = { currentPassword: 'WrongPass123!', password: 'NewPass456!' }
const searchOptions: Pick<Filters, 'genre' | 'price' | 'publishYear'> = {
  genre: ['Fiction', 'Drama'],
  price: [0, 100],
  publishYear: [1900, 2024],
}

const jsonResponse = (
  data: unknown,
  status = 200,
  headers?: Record<string, string>,
) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
const requestOf = (input: RequestInfo | URL): Request =>
  input instanceof Request ? input : new Request(input)

let store: ReturnType<typeof createAppStore>
let accessToken: string | null
let refresh: ReturnType<
  typeof vi.fn<() => Promise<{ accessToken: string | null }>>
>
let expire: ReturnType<typeof vi.fn<(accessToken: string) => void>>
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>
let capturedRequests: Request[]

beforeEach(() => {
  confirmPayment.mockReset().mockResolvedValue({
    paymentIntent: { status: 'succeeded' },
  })
  store = createAppStore()
  store.dispatch(authSessionChanged('old-token'))
  accessToken = 'old-token'
  refresh = vi
    .fn<() => Promise<{ accessToken: string | null }>>()
    .mockImplementation(() => Promise.resolve({ accessToken }))
  expire = vi.fn((rejectedToken: string) => {
    if (accessToken === rejectedToken) {
      accessToken = null
    }
  })
  privateApi.configureAuthRequest({
    getAccessToken: () => accessToken,
    refresh,
    expire,
  })
  fetchMock = vi.fn<typeof fetch>().mockImplementation((input) => {
    const request = requestOf(input)
    const isCmsBook = new URL(request.url).pathname.endsWith('/cms/books')

    return Promise.resolve(
      jsonResponse(
        isCmsBook ? (request.method === 'PATCH' ? cmsBook : [cmsBook]) : book,
      ),
    )
  })
  capturedRequests = []
  const mockFetch: typeof fetch = (input, options) => {
    capturedRequests.push(requestOf(input).clone())

    return fetchMock(input, options)
  }

  vi.stubGlobal('fetch', mockFetch)

  // Use real Ky/hooks with an absolute test URL; no network/provider calls.
  const publicClient = publicApi.baseRequest.extend({
    prefix: 'https://bookshop.test/api',
    retry: 0,
  })
  const privateClient = privateApi.authRequest.extend({
    prefix: 'https://bookshop.test/api',
    retry: 0,
  })

  Object.assign(
    vi.spyOn(publicApi, 'baseRequest').mockImplementation(publicClient),
    publicClient,
  )
  Object.assign(
    vi.spyOn(privateApi, 'authRequest').mockImplementation(privateClient),
    privateClient,
  )
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  privateApi.configureAuthRequest({
    getAccessToken: () => appStore.getState().user.accessToken,
    refresh: () => appStore.dispatch(fetchAuthTokens()).unwrap(),
    expire: (rejectedToken) =>
      appStore.dispatch(expireAuthSession(rejectedToken)),
  })
})

function StoreProvider({ children }: { children: ReactNode }) {
  return createElement(Provider, { store, children })
}

describe('server-data cache', () => {
  it('refreshes changed checkout terms after submission, without focus or reconnect requests', async () => {
    let version = 'original'
    let finishReview: (() => void) | undefined
    let holdReview = false
    fetchMock.mockImplementation(async (input) => {
      const request = requestOf(input)

      if (request.method === 'POST') {
        const acceptance = (await request.json()) as { version: string }

        return acceptance.version !== version
          ? jsonResponse({ code: 'TERMS_CHANGED' }, 412)
          : jsonResponse({
              version,
              language: 'en',
              statement: 'Accept terms',
              acceptedAt: '2026-10-30T00:00:00Z',
            })
      }

      const response = jsonResponse({
        terms: {
          version,
          url: `https://bookshop.test/terms/${version}`,
          publishedAt: '2026-10-30T00:00:00Z',
          statements: { en: 'Accept terms', hu: 'Elfogadom' },
        },
        order: { total: 12, currency: 'USD', items: [] },
      })

      if (holdReview) {
        return new Promise((resolve) => {
          finishReview = () => resolve(response)
        })
      }

      return response
    })
    await store.dispatch(
      usersApi.util.upsertQueryData('userProfile', undefined, profile),
    )
    const profileQuery = store.dispatch(
      usersApi.endpoints.userProfile.initiate(undefined, {
        subscriptionOptions: {
          refetchOnFocus: false,
          refetchOnReconnect: false,
        },
      }),
    )
    store.dispatch(
      checkoutReady({
        paymentId: 'pi_submit',
        paymentToken: 'test',
        amount: 1200,
      }),
    )
    render(
      createElement(MemoryRouter, { children: createElement(CheckoutForm) }),
      {
        wrapper: StoreProvider,
      },
    )

    await userEvent.click(await screen.findByRole('checkbox'))
    version = 'updated'
    holdReview = true

    await act(async () => {
      store.dispatch(bookshopApi.internalActions.onFocusLost())
      store.dispatch(bookshopApi.internalActions.onOffline())
      store.dispatch(bookshopApi.internalActions.onFocus())
      store.dispatch(bookshopApi.internalActions.onOnline())
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(capturedRequests).toHaveLength(1)
    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://bookshop.test/terms/original',
    )

    await userEvent.click(screen.getByRole('button', { name: /^Place order/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The terms and conditions have changed',
    )
    await waitFor(() => expect(finishReview).toBeDefined())
    expect(confirmPayment).not.toHaveBeenCalled()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading terms and conditions',
    )
    expect(screen.getByRole('button', { name: /^Place order/ })).toBeDisabled()
    expect(capturedRequests.map((request) => request.method)).toEqual([
      'GET',
      'POST',
      'GET',
    ])

    act(() => {
      finishReview?.()
    })
    expect(await screen.findByRole('checkbox')).not.toBeChecked()
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://bookshop.test/terms/updated',
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The terms and conditions have changed',
    )
    expect(screen.getByRole('button', { name: /^Place order/ })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: /^Retry payment/ }),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /^Place order/ }))
    await waitFor(() => expect(confirmPayment).toHaveBeenCalledTimes(1))
    expect(await capturedRequests.at(-1)?.json()).toEqual({
      version: 'updated',
      language: 'en',
      accepted: true,
    })
    profileQuery.unsubscribe()
  })

  it('refreshes current terms, history and checkout references and evicts a deleted archive', async () => {
    const document = {
      version: 'unused',
      publishedAt: '2026-10-14T10:00:00.000Z',
      content: { en: 'English', hu: 'Magyar' },
      statements: { en: 'Accept', hu: 'Elfogadom' },
    }
    let deleted = false
    fetchMock.mockImplementation((input) => {
      const request = requestOf(input)
      const path = new URL(request.url).pathname

      if (request.method === 'DELETE') {
        deleted = true

        return Promise.resolve(new Response(null, { status: 204 }))
      }

      return Promise.resolve(
        jsonResponse(
          path.endsWith('/terms/history')
            ? deleted
              ? []
              : [
                  {
                    version: document.version,
                    publishedAt: document.publishedAt,
                    canDelete: true,
                  },
                ]
            : path.includes('/payments/')
              ? {
                  terms: deleted
                    ? null
                    : {
                        version: document.version,
                        statements: document.statements,
                        publishedAt: document.publishedAt,
                        url: '/terms/unused',
                      },
                  order: { items: [], total: 0, currency: 'USD' },
                }
              : deleted
                ? null
                : document,
        ),
      )
    })
    const current = store.dispatch(termsApi.endpoints.cmsTerms.initiate())
    const history = store.dispatch(
      termsApi.endpoints.cmsTermsHistory.initiate(),
    )
    const checkout = store.dispatch(
      termsApi.endpoints.paymentTerms.initiate('pi_terms'),
    )
    await Promise.all([
      current.unwrap(),
      history.unwrap(),
      checkout.unwrap(),
      store
        .dispatch(
          termsApi.endpoints.termsDocument.initiate('unused', {
            subscribe: false,
          }),
        )
        .unwrap(),
    ])
    await store
      .dispatch(termsApi.endpoints.deleteTermsVersion.initiate('unused'))
      .unwrap()

    await vi.waitFor(() => {
      expect(
        termsApi.endpoints.cmsTerms.select()(store.getState()).data,
      ).toBeNull()
      expect(
        termsApi.endpoints.cmsTermsHistory.select()(store.getState()).data,
      ).toEqual([])
      expect(
        termsApi.endpoints.paymentTerms.select('pi_terms')(store.getState())
          .data?.terms,
      ).toBeNull()
      expect(
        termsApi.endpoints.termsDocument.select('unused')(store.getState())
          .isUninitialized,
      ).toBe(true)
    })
    const request = capturedRequests.find(
      (request) => request.method === 'DELETE',
    )
    expect(request?.headers.get('authorization')).toBe('Bearer old-token')
    expect(new URL(request!.url).pathname).toBe('/api/cms/terms/unused')
    current.unsubscribe()
    history.unsubscribe()
    checkout.unsubscribe()
  })

  it('refreshes current terms and publication history after publishing while retaining immutable archives', async () => {
    const original = {
      version: 'original',
      publishedAt: '2026-10-14T10:00:00.000Z',
      content: { en: 'Original English', hu: 'Eredeti magyar' },
      statements: { en: 'Accept', hu: 'Elfogadom' },
    }
    let current = original
    let history = [
      { version: original.version, publishedAt: original.publishedAt },
    ]
    fetchMock.mockImplementation((input) => {
      const request = requestOf(input)
      const path = new URL(request.url).pathname

      return Promise.resolve(
        jsonResponse(
          path.endsWith('/terms/history')
            ? history
            : path.endsWith('/terms/original')
              ? original
              : current,
        ),
      )
    })
    const currentQuery = store.dispatch(termsApi.endpoints.cmsTerms.initiate())
    const historyQuery = store.dispatch(
      termsApi.endpoints.cmsTermsHistory.initiate(),
    )
    const archiveQuery = store.dispatch(
      termsApi.endpoints.termsDocument.initiate('original'),
    )
    await Promise.all([
      currentQuery.unwrap(),
      historyQuery.unwrap(),
      archiveQuery.unwrap(),
    ])
    const historyRequest = capturedRequests.find((request) =>
      new URL(request.url).pathname.endsWith('/cms/terms/history'),
    )
    expect(historyRequest?.headers.get('authorization')).toBe(
      'Bearer old-token',
    )
    current = {
      ...original,
      version: 'updated',
      publishedAt: '2026-10-15T10:00:00.000Z',
      content: { en: 'Updated English', hu: 'Új magyar' },
    }
    history = [
      { version: current.version, publishedAt: current.publishedAt },
      ...history,
    ]
    const mutation = store.dispatch(
      termsApi.endpoints.publishTerms.initiate({ content: current.content }),
    )
    await mutation.unwrap()

    await vi.waitFor(() => {
      expect(
        termsApi.endpoints.cmsTerms.select()(store.getState()).data,
      ).toEqual(current)
      expect(
        termsApi.endpoints.cmsTermsHistory.select()(store.getState()).data,
      ).toEqual(history)
    })
    expect(
      termsApi.endpoints.termsDocument.select('original')(store.getState())
        .data,
    ).toEqual(original)
    expect(
      capturedRequests.filter((request) =>
        new URL(request.url).pathname.endsWith('/terms/original'),
      ),
    ).toHaveLength(1)
    currentQuery.unsubscribe()
    historyQuery.unsubscribe()
    archiveQuery.unsubscribe()
    mutation.reset()
  })

  it('reuses the unfiltered cache after submitting full displayed ranges', async () => {
    await store.dispatch(
      booksApi.util.upsertQueryData('searchOptions', undefined, {
        ...searchOptions,
        price: [0.25, 99.75],
      }),
    )
    fetchMock.mockResolvedValue(
      jsonResponse([book], 200, { 'x-total-count': '1' }),
    )
    const originalArgs = booksQueryArgs(store.getState())
    await store
      .dispatch(
        booksApi.endpoints.books.initiate(originalArgs, {
          subscribe: false,
        }),
      )
      .unwrap()

    store.dispatch(
      applyBooksFilters({
        ...store.getState().books.booksFilters.active,
        price: [0, 100],
      }),
    )
    const submittedArgs = booksQueryArgs(store.getState())

    expect(submittedArgs).toEqual(originalArgs)
    expect(submittedArgs.criteria).toBeUndefined()
    await store
      .dispatch(
        booksApi.endpoints.books.initiate(submittedArgs, {
          subscribe: false,
        }),
      )
      .unwrap()

    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('deduplicates concurrent queries without a second entity slice', async () => {
    const a = store.dispatch(
      booksApi.endpoints.book.initiate(7, { subscribe: false }),
    )
    const b = store.dispatch(
      booksApi.endpoints.book.initiate(7, { subscribe: false }),
    )

    await Promise.all([a.unwrap(), b.unwrap()])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(store.getState().books).not.toHaveProperty('books')
    expect(booksApi.endpoints.book.select(7)(store.getState()).data).toEqual(
      book,
    )
  })

  it('refreshes public and CMS books after a CMS mutation', async () => {
    const publicQuery = store.dispatch(booksApi.endpoints.book.initiate(7))
    const cmsQuery = store.dispatch(booksApi.endpoints.cmsBooks.initiate())

    await Promise.all([publicQuery.unwrap(), cmsQuery.unwrap()])
    const changed = {
      ...book,
      title: 'Updated book',
      price: 12,
      discountPrice: 12,
    }

    fetchMock.mockImplementation((input) => {
      const request = requestOf(input)
      const isCmsBook = new URL(request.url).pathname.endsWith('/cms/books')

      return Promise.resolve(
        jsonResponse(
          isCmsBook
            ? request.method === 'PATCH'
              ? { ...changed, authorId: 1 }
              : [{ ...changed, authorId: 1 }]
            : changed,
        ),
      )
    })
    const mutation = store.dispatch(
      booksApi.endpoints.updateBook.initiate({
        id: 7,
        title: changed.title,
      }),
    )
    await mutation.unwrap()
    mutation.reset()
    await vi.waitFor(() => {
      expect(
        booksApi.endpoints.book.select(7)(store.getState()).data?.title,
      ).toBe(changed.title)
      expect(
        booksApi.endpoints.cmsBooks.select()(store.getState()).data?.[0]?.title,
      ).toBe(changed.title)
    })
    expect(store.getState().bookshopApi.mutations).toEqual({})
    publicQuery.unsubscribe()
    cmsQuery.unsubscribe()
  })

  it('invalidates cached books after an author mutation from another domain', async () => {
    const author = {
      id: 1,
      name: 'Updated author',
      fullName: 'Updated author',
      birthYear: '1980',
      deathYear: '',
      homeland: 'Hungary',
      biography: '',
    }
    let authorName = book.author
    fetchMock.mockImplementation((input) => {
      if (requestOf(input).method === 'PATCH') {
        authorName = author.name

        return Promise.resolve(jsonResponse(author))
      }

      return Promise.resolve(jsonResponse({ ...book, author: authorName }))
    })
    const query = store.dispatch(booksApi.endpoints.book.initiate(book.id))
    await query.unwrap()

    const mutation = store.dispatch(
      authorsApi.endpoints.updateAuthor.initiate({
        id: author.id,
        name: author.name,
      }),
    )
    await mutation.unwrap()
    mutation.reset()

    await vi.waitFor(() => {
      expect(
        booksApi.endpoints.book.select(book.id)(store.getState()).data?.author,
      ).toBe(author.name)
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    query.unsubscribe()
  })

  it('refreshes retained recommendations after a CMS book edit even with focus/reconnect refetch disabled', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse([book])))
    const query = store.dispatch(
      booksApi.endpoints.booksByProperty.initiate('recommended', {
        subscriptionOptions: {
          refetchOnFocus: false,
          refetchOnReconnect: false,
        },
      }),
    )

    await query.unwrap()
    const changed = { ...book, title: 'Updated recommendation' }

    fetchMock.mockImplementation((input) =>
      Promise.resolve(
        jsonResponse(
          requestOf(input).method === 'PATCH'
            ? { ...changed, authorId: 1 }
            : [changed],
        ),
      ),
    )
    await store
      .dispatch(
        booksApi.endpoints.updateBook.initiate({
          id: changed.id,
          title: changed.title,
        }),
      )
      .unwrap()
    await vi.waitFor(() => {
      expect(
        booksApi.endpoints.booksByProperty.select('recommended')(
          store.getState(),
        ).data?.[0]?.title,
      ).toBe(changed.title)
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    query.unsubscribe()
  })

  it('stores serializable failures rather than thrown provider objects', async () => {
    vi.mocked(publicApi.baseRequest).mockRejectedValue(
      new Error('Book unavailable'),
    )
    await store.dispatch(
      booksApi.endpoints.book.initiate(7, { subscribe: false }),
    )
    expect(booksApi.endpoints.book.select(7)(store.getState()).error).toEqual({
      code: 'UNKNOWN_API_ERROR',
    })
  })
})

describe('catalogue filter criteria', () => {
  const initial: Filters = {
    ...searchOptions,
    genre: [],
    discount: 'allBooks',
    rating: 0.5,
  }

  it.each([
    {
      name: 'full ranges',
      initialPrice: [0, 100],
      price: [0, 100],
      publishYear: [1900, 2024],
    },
    {
      name: 'cleared ranges',
      initialPrice: [0, 100],
      price: [],
      publishYear: [],
    },
    {
      name: 'outward-rounded prices',
      initialPrice: [0.25, 99.75],
      price: [0, 100],
      publishYear: [1900, 2024],
    },
  ])('omits criteria for $name', ({ initialPrice, price, publishYear }) => {
    expect(
      buildBookCriteria(
        { ...initial, price: initialPrice },
        { ...initial, price, publishYear },
      ),
    ).toBeUndefined()
  })

  it('retains submitted bounds when reference ranges are not available yet', () => {
    expect(
      buildBookCriteria(
        { ...initial, price: [], publishYear: [] },
        { ...initial, price: [0, 50], publishYear: [2000, 2024] },
      ),
    ).toEqual({
      discountPrice_gte: 0,
      discountPrice_lte: 50,
      publishYear_gte: 2000,
      publishYear_lte: 2024,
    })
  })

  it.each<{
    name: string
    filters: Partial<Filters>
    expected: Record<string, string>
  }>([
    {
      name: 'lower price',
      filters: { price: [25, 100] },
      expected: { discountPrice_gte: '25' },
    },
    {
      name: 'upper price',
      filters: { price: [0, 75] },
      expected: { discountPrice_lte: '75' },
    },
    {
      name: 'zero upper price',
      filters: { price: [0, 0] },
      expected: { discountPrice_lte: '0' },
    },
    {
      name: 'lower publication year',
      filters: { publishYear: [2000, 2024] },
      expected: { publishYear_gte: '2000' },
    },
    {
      name: 'upper publication year',
      filters: { publishYear: [1900, 2000] },
      expected: { publishYear_lte: '2000' },
    },
  ])(
    'sends the $name bound without the unchanged bound',
    ({ filters, expected }) => {
      const criteria = buildBookCriteria(initial, { ...initial, ...filters })

      expect(
        Object.fromEntries(
          booksSearchParams({
            currentPage: 1,
            itemsPerPage: 8,
            criteria,
          }),
        ),
      ).toEqual({ page: '1', limit: '8', ...expected })
    },
  )

  it('retains selected genres, discount mode, and rating with full ranges', () => {
    const criteria = buildBookCriteria(initial, {
      ...initial,
      genre: ['Science & nature'],
      discount: 'fullPriceOnly',
      rating: 2.5,
    })

    expect(
      Object.fromEntries(
        booksSearchParams({
          currentPage: 1,
          itemsPerPage: 8,
          criteria,
        }),
      ),
    ).toEqual({
      page: '1',
      limit: '8',
      genre: 'Science & nature',
      discount: '0',
      rating_gte: '2.5',
    })
  })
})

describe('user profile cache', () => {
  it('deduplicates profile reads and derives the user view without a slice copy', async () => {
    const get = fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse(profile)),
    )
    const queries = [1, 2].map(() =>
      store.dispatch(
        usersApi.endpoints.userProfile.initiate(undefined, {
          subscribe: false,
        }),
      ),
    )

    await Promise.all(queries.map((query) => query.unwrap()))
    expect(get).toHaveBeenCalledTimes(1)
    expect(store.getState().user).not.toHaveProperty('userData')
    expect(userSelector(store.getState()).userData).toEqual(profile)
  })

  it('refreshes the subscribed profile after an account update', async () => {
    const request = fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse(profile)),
    )
    const query = store.dispatch(usersApi.endpoints.userProfile.initiate())
    await query.unwrap()

    const updated = { ...profile, firstName: 'Updated' }
    request.mockImplementation(() => Promise.resolve(jsonResponse(updated)))
    const mutation = store.dispatch(
      usersApi.endpoints.updateUserProfile.initiate({
        firstName: 'Updated',
      }),
    )
    await mutation.unwrap()

    await vi.waitFor(() => {
      expect(userSelector(store.getState()).userData?.firstName).toBe('Updated')
    })
    expect(request).toHaveBeenCalledTimes(3)
    query.unsubscribe()
    mutation.reset()
  })

  it('preserves the server password code as a serializable mutation failure', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ code: 'CURRENT_PASSWORD_INCORRECT' }, 400),
    )
    const mutation = store.dispatch(
      usersApi.endpoints.updateUserProfile.initiate(fields),
    )

    await expect(mutation.unwrap()).rejects.toEqual({
      status: 400,
      code: 'CURRENT_PASSWORD_INCORRECT',
    })
    const result = await mutation
    expect(getErrorMessage(result.error, 'Fallback')).toBe(
      'Your current password is incorrect.',
    )
    const request = capturedRequests[0]!
    expect(new URL(request.url).pathname).toBe('/api/' + PATH.users.profile)
    expect(request.method).toBe('PATCH')
    expect(await request.json()).toEqual(fields)
    mutation.reset()
  })

  it('leaves fallback wording to the UI for failures without an error message', async () => {
    vi.mocked(privateApi.authRequest).mockRejectedValue(undefined)
    const mutation = store.dispatch(
      usersApi.endpoints.updateUserProfile.initiate(fields),
    )

    await expect(mutation.unwrap()).rejects.toEqual({
      code: 'UNKNOWN_API_ERROR',
    })
    const result = await mutation
    expect(getErrorMessage(result.error, i18n.t('common.requestFailed'))).toBe(
      'Request failed',
    )
    mutation.reset()
  })
})

describe('generated query hooks', () => {
  beforeEach(() => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse(searchOptions)),
    )
  })

  it('reads the existing endpoint cache without arguments or another request', async () => {
    await store.dispatch(
      booksApi.util.upsertQueryData('searchOptions', undefined, searchOptions),
    )

    const { result } = renderHook(() => useSearchOptionsQuery(), {
      wrapper: StoreProvider,
    })

    expectTypeOf(result.current.data).toEqualTypeOf<
      typeof searchOptions | undefined
    >()
    expect(result.current.data).toEqual(searchOptions)
    expect(result.current.isSuccess).toBe(true)
    expect(publicApi.baseRequest).not.toHaveBeenCalled()
  })

  it('supports skipping and infers the selected result when enabled', async () => {
    const { result, rerender } = renderHook(
      ({ skip }) =>
        useSearchOptionsQuery(undefined, {
          skip,
          selectFromResult: ({ data }) => ({ genres: data?.genre ?? [] }),
        }),
      { initialProps: { skip: true }, wrapper: StoreProvider },
    )

    expectTypeOf(result.current.genres).toEqualTypeOf<string[]>()
    expectTypeOf(result.current).not.toHaveProperty('data')
    expectTypeOf(result.current.refetch).toBeFunction()
    expect(result.current.genres).toEqual([])
    expect(publicApi.baseRequest).not.toHaveBeenCalled()

    rerender({ skip: false })

    await waitFor(() => {
      expect(result.current.genres).toEqual(searchOptions.genre)
    })
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(1)
    expect(
      booksApi.endpoints.searchOptions.select()(store.getState()).data,
    ).toEqual(searchOptions)
  })
})

describe('Ky adapter', () => {
  it('preserves API codes and validation details in the cache for translation at display time', async () => {
    const failure = {
      code: 'VALIDATION_ERROR',
      validation: [
        {
          path: ['email'],
          code: 'invalid_format',
          origin: 'string',
          format: 'email',
        },
      ],
    }
    fetchMock.mockResolvedValueOnce(jsonResponse(failure, 400))
    const result = await store.dispatch(
      booksApi.endpoints.book.initiate(7, { subscribe: false }),
    )

    expect(result.error).toEqual({ ...failure, status: 400 })
    expect(getErrorMessage(result.error, 'Fallback')).toBe(
      'Email: Invalid Email',
    )

    await act(() => i18n.changeLanguage('hu'))

    const cached = booksApi.endpoints.book.select(7)(store.getState())
    expect(getErrorMessage(cached.error, 'Fallback')).toBe(
      `${i18n.t('common.fields.email')}: ${i18n.t('validation.email')}`,
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('keeps public queries anonymous and maps pagination headers and filters', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([], 200, { 'x-total-count': '42' }),
    )
    const result = await store
      .dispatch(
        booksApi.endpoints.books.initiate(
          {
            currentPage: 2,
            itemsPerPage: 10,
            criteria: {
              genre: ['Science & nature', 'Fiction'],
              discountPrice_gte: 0,
              discountPrice_lte: 20,
              discount_gte: 1,
              publishYear_gte: 2000,
              publishYear_lte: 2025,
              rating_gte: 3.5,
            },
          },
          { subscribe: false },
        ),
      )
      .unwrap()

    expect(result).toEqual({ books: [], total: 42 })
    const request = requestOf(fetchMock.mock.calls[0]![0])
    const params = new URL(request.url).searchParams

    expect(params.getAll('genre')).toEqual(['Science & nature', 'Fiction'])
    expect(Object.fromEntries(params)).toMatchObject({
      page: '2',
      limit: '10',
      discountPrice_gte: '0',
      discountPrice_lte: '20',
      discount_gte: '1',
      publishYear_gte: '2000',
      publishYear_lte: '2025',
      rating_gte: '3.5',
    })
    expect(request.headers.has('authorization')).toBe(false)
    expect(request.headers.get('ngrok-skip-browser-warning')).toBe('true')
    expect(refresh).not.toHaveBeenCalled()
  })

  it('encodes search text as a query value rather than extra parameters', async () => {
    await store
      .dispatch(
        booksApi.endpoints.bookSearch.initiate('A & B?genre=Fake', {
          subscribe: false,
        }),
      )
      .unwrap()
    const params = new URL(requestOf(fetchMock.mock.calls[0]![0]).url)
      .searchParams

    expect(params.get('title')).toBe('A & B?genre=Fake')
    expect(params.has('genre')).toBe(false)
  })

  it('sends authenticated CMS mutation methods and JSON bodies', async () => {
    await store
      .dispatch(
        booksApi.endpoints.updateBook.initiate({ id: 7, title: 'Updated' }),
      )
      .unwrap()
    await store
      .dispatch(booksApi.endpoints.hardDeleteBooks.initiate([7]))
      .unwrap()
    const patch = capturedRequests[0]!
    const remove = capturedRequests[1]!

    expect(patch.method).toBe('PATCH')
    expect(patch.headers.get('authorization')).toBe('Bearer old-token')
    expect(await patch.json()).toEqual({ id: 7, title: 'Updated' })
    expect(remove.method).toBe('DELETE')
    expect(await remove.json()).toEqual({ bookIds: [7] })
  })

  it('accepts Ky request options and methods without shorthand functions', async () => {
    const api = bookshopApi.injectEndpoints({
      endpoints: (build) => ({
        requestOptionsProbe: build.query<unknown, void>({
          query: () => ({
            url: 'books',
            method: 'OPTIONS',
            cache: 'no-store',
          }),
        }),
      }),
    })

    await store.dispatch(api.endpoints.requestOptionsProbe.initiate()).unwrap()

    expect(capturedRequests[0]?.method).toBe('OPTIONS')
    expect(capturedRequests[0]?.cache).toBe('no-store')
  })

  it('allows guest checkout queries to use auth handling with cookies and no Bearer token', async () => {
    accessToken = null
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        terms: null,
        order: { items: [], total: 10, currency: 'eur' },
      }),
    )

    await store
      .dispatch(
        termsApi.endpoints.paymentTerms.initiate('pi_guest', {
          subscribe: false,
        }),
      )
      .unwrap()

    const request = capturedRequests[0]!
    expect(new URL(request.url).pathname).toBe('/api/payments/pi_guest/terms')
    expect(request.credentials).toBe('include')
    expect(request.headers.has('Authorization')).toBe(false)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('returns a serializable refresh failure without retrying the request', async () => {
    refresh.mockRejectedValue(new Error('Session expired'))
    fetchMock.mockResolvedValueOnce(jsonResponse([], 401))
    const result = await store.dispatch(
      ordersApi.endpoints.userOrders.initiate(undefined, {
        subscribe: false,
      }),
    )

    expect(result.error).toEqual({
      code: 'UNKNOWN_API_ERROR',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it.each([
    { reason: 'the account no longer exists', refreshedAccessToken: null },
    {
      reason: 'the refreshed token is rejected',
      refreshedAccessToken: 'new-token',
    },
  ])(
    'stops subscribed profile requests and clears private data when $reason',
    async ({ refreshedAccessToken }) => {
      store.dispatch(authSessionChanged('old-token'))
      await store.dispatch(
        ordersApi.util.upsertQueryData('userOrders', undefined, []),
      )
      privateApi.configureAuthRequest({
        getAccessToken: () => store.getState().user.accessToken,
        refresh: () => store.dispatch(fetchAuthTokens()).unwrap(),
        expire: (rejectedToken) =>
          store.dispatch(expireAuthSession(rejectedToken)),
      })
      fetchMock.mockImplementation((input) => {
        const path = new URL(requestOf(input).url).pathname

        return Promise.resolve(
          path.endsWith('/users/refresh')
            ? jsonResponse({ accessToken: refreshedAccessToken })
            : jsonResponse({ error: 'Session unavailable' }, 401),
        )
      })

      const view = renderHook(
        () => {
          const sessionToken = useSelector(
            (state: RootState) => state.user.accessToken,
          )

          return useUserProfileQuery(undefined, { skip: !sessionToken })
        },
        { wrapper: StoreProvider },
      )

      await waitFor(() => {
        expect(store.getState().user.accessToken).toBeNull()
        expect(
          ordersApi.endpoints.userOrders.select()(store.getState())
            .isUninitialized,
        ).toBe(true)
      })
      await act(async () => {
        store.dispatch(bookshopApi.internalActions.onFocus())
        store.dispatch(bookshopApi.internalActions.onOnline())

        await Promise.resolve()
      })

      expect(
        capturedRequests.map((request) => new URL(request.url).pathname),
      ).toEqual([
        '/api/users/profile',
        '/api/users/refresh',
        ...(refreshedAccessToken ? ['/api/users/profile'] : []),
      ])
      expect(capturedRequests[1]?.credentials).toBe('include')
      view.unmount()
    },
  )

  it('forwards aborts to the actual Ky request', async () => {
    let requestSignal: AbortSignal | undefined

    fetchMock.mockImplementation((input) => {
      requestSignal = requestOf(input).signal

      return new Promise<Response>((_resolve, reject) => {
        requestSignal!.addEventListener(
          'abort',
          () => reject(new DOMException('Aborted', 'AbortError')),
          { once: true },
        )
      })
    })
    const query = store.dispatch(
      booksApi.endpoints.book.initiate(7, { subscribe: false }),
    )

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
    query.abort()
    await query
    expect(requestSignal?.aborted).toBe(true)
    expect(refresh).not.toHaveBeenCalled()
    expect(vi.spyOn(log, 'warn')).not.toHaveBeenCalled()
    expect(vi.spyOn(log, 'error')).not.toHaveBeenCalled()
  })

  it('handles successful no-content responses without trying to parse JSON', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    const result = await store
      .dispatch(booksApi.endpoints.hardDeleteBooks.initiate([7]))
      .unwrap()

    expect(result).toBeNull()
  })

  it('returns malformed JSON and network failures as query errors', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('not json', {
        headers: { 'content-type': 'application/json' },
      }),
    )
    const malformed = await store.dispatch(
      booksApi.endpoints.book.initiate(7, { subscribe: false }),
    )

    expect(malformed.error).toEqual({
      code: 'UNKNOWN_API_ERROR',
    })
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const offline = await store.dispatch(
      booksApi.endpoints.book.initiate(8, { subscribe: false }),
    )

    expect(offline.error).toEqual({
      code: 'UNKNOWN_API_ERROR',
    })
  })
})
