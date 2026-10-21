import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { act, render, screen } from '@testing-library/react'
import ky from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authRequest } from '@/api/authRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import { CMS } from './CMS'
import { Authors } from './components/Authors/Authors'
import { Books } from './components/Books/Books'
import { Orders } from './components/Orders/Orders'
import { Users } from './components/Users/Users'

let store: ReturnType<typeof createAppStore>

beforeEach(() => {
  store = createAppStore()
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  vi.restoreAllMocks()
})

describe('CMS list loading', () => {
  it.each([
    { tab: 'orders', Component: Orders },
    { tab: 'books', Component: Books },
    { tab: 'authors', Component: Authors },
    { tab: 'users', Component: Users },
  ])(
    'shows loading before an empty $tab response arrives',
    async ({ tab, Component }) => {
      let completeRequest!: (response: Response) => void
      const response = new Promise<Response>((resolve) => {
        completeRequest = resolve
      })
      vi.spyOn(authRequest, 'get').mockImplementation(() =>
        ky.get('https://bookshop.test/mock', {
          retry: 0,
          fetch: () => response.then((value) => value.clone()),
        }),
      )

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={[`/cms/${tab}`]}>
            <Routes>
              <Route path="/cms" element={<CMS />}>
                <Route path={tab} element={<Component />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </Provider>,
      )

      expect(screen.getByText(`Loading ${tab}`)).toBeInTheDocument()
      expect(screen.queryByText(`No ${tab} found`)).not.toBeInTheDocument()

      act(() => {
        completeRequest(
          new Response('[]', {
            headers: { 'content-type': 'application/json' },
          }),
        )
      })

      expect(await screen.findByText(`No ${tab} found`)).toBeInTheDocument()
      expect(screen.queryByText(`Loading ${tab}`)).not.toBeInTheDocument()
    },
  )
})
