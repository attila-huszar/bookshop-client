import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { i18n } from '@/i18n'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, Formik } from 'formik'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as publicApi from '@/api/baseRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { usersApi } from '@/store/api/usersApi'
import { createAppStore } from '@/store/store'
import { CountrySelect } from './CountrySelect'

let store: ReturnType<typeof createAppStore>
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>

beforeEach(() => {
  store = createAppStore()
  fetchMock = vi.fn<typeof fetch>().mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify({ hu: 'Hungary', us: 'United States' }), {
        headers: { 'content-type': 'application/json' },
      }),
    ),
  )
  vi.stubGlobal('fetch', fetchMock)
  const client = publicApi.baseRequest.extend({
    prefix: 'https://bookshop.test/api',
    retry: 0,
  })

  vi.spyOn(publicApi, 'baseRequest').mockImplementation(client)
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const renderCountries = () =>
  render(
    <StrictMode>
      <Provider store={store}>
        <Formik
          initialValues={{ country: 'hu', shippingCountry: 'us' }}
          onSubmit={vi.fn()}>
          <Form>
            <CountrySelect />
            <CountrySelect fieldName="shippingCountry" />
          </Form>
        </Formik>
      </Provider>
    </StrictMode>,
  )

describe('country reference data', () => {
  it('localizes country names without refetching or changing cached data', async () => {
    renderCountries()
    expect(await screen.findByText('Hungary')).toBeInTheDocument()

    await act(async () => {
      await i18n.changeLanguage('hu')
    })

    expect(screen.getByText('Magyarország')).toBeInTheDocument()
    expect(screen.getByText('Egyesült Államok')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(
      usersApi.endpoints.countryCodes.select()(store.getState()).data?.hu,
    ).toBe('Hungary')
  })

  it('shows loading instead of no matches while country data is pending', async () => {
    let completeRequest!: (response: Response) => void
    const response = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    fetchMock.mockImplementation(() => response)
    renderCountries()

    await userEvent.click(screen.getByText('HU'))

    expect(screen.getByRole('status')).toHaveTextContent('Loading countries…')
    expect(screen.queryByText('No countries found')).not.toBeInTheDocument()

    act(() => {
      completeRequest(
        new Response(JSON.stringify({ hu: 'Hungary', us: 'United States' }), {
          headers: { 'content-type': 'application/json' },
        }),
      )
    })

    expect(
      await screen.findByText('Hungary', { selector: 'li span' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shares one request across Strict Mode effects, dropdowns, remounts, and focus/reconnect', async () => {
    const { unmount } = renderCountries()

    expect(await screen.findByText('Hungary')).toBeInTheDocument()
    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    unmount()

    const view = renderCountries()

    expect(await screen.findByText('Hungary')).toBeInTheDocument()
    await act(async () => {
      store.dispatch(bookshopApi.internalActions.onFocus())
      store.dispatch(bookshopApi.internalActions.onOnline())

      await Promise.resolve()
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const input = fetchMock.mock.calls[0]![0]
    const request = input instanceof Request ? input : new Request(input)

    expect(new URL(request.url).pathname).toBe('/api/users/country-codes')
    expect(request.headers.has('authorization')).toBe(false)
    view.unmount()
  })
})
