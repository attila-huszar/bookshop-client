import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import * as usersApi from '@/api/users'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import { Registration } from './Registration'

describe('Registration country detection', () => {
  let store: ReturnType<typeof createAppStore>
  let detectCountry: (value: { country: string }) => void
  let countryResponse: ReturnType<typeof usersApi.getUserCountry>

  beforeEach(async () => {
    store = createAppStore()
    await store.dispatch(
      bookshopApi.util.upsertQueryData('countryCodes', undefined, {
        hu: 'Hungary',
        us: 'United States',
        gb: 'United Kingdom',
      }),
    )
    countryResponse = new Promise((resolve) => {
      detectCountry = resolve
    })
    vi.spyOn(usersApi, 'getUserCountry').mockReturnValue(countryResponse)
  })

  afterEach(() => {
    act(() => {
      store.dispatch(bookshopApi.util.resetApiState())
    })
    vi.restoreAllMocks()
  })

  const renderRegistration = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Registration />
        </MemoryRouter>
      </Provider>,
    )

  it('keeps entered fields and the selected avatar when country detection finishes', async () => {
    renderRegistration()
    const firstName = screen.getByPlaceholderText('First Name')
    const email = screen.getByPlaceholderText('Email')
    const avatar = screen.getByLabelText(/upload/i)
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    await userEvent.type(firstName, 'Jane')
    await userEvent.type(email, 'jane@example.com')
    await userEvent.upload(avatar, file)
    await act(async () => {
      detectCountry({ country: 'us' })
      await countryResponse
    })

    expect(firstName).toHaveValue('Jane')
    expect(email).toHaveValue('jane@example.com')
    expect(avatar).toHaveProperty('files', expect.objectContaining({ 0: file }))
    expect(screen.getByText('United States')).toBeInTheDocument()
  })

  it('preserves an explicit country choice made before detection finishes', async () => {
    renderRegistration()
    await userEvent.click(screen.getByText('Hungary'))
    await userEvent.click(screen.getByText('United States'))
    await act(async () => {
      detectCountry({ country: 'gb' })
      await countryResponse
    })

    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(screen.queryByText('United Kingdom')).not.toBeInTheDocument()
  })
})
