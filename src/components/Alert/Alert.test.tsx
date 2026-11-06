import { MemoryRouter } from 'react-router'
import { i18n } from '@/i18n'
import { act, render, screen } from '@testing-library/react'
import en from '../../../public/locales/en/translation.json'
import hu from '../../../public/locales/hu/translation.json'
import { Alert } from './Alert'

describe('Error Component', () => {
  it('updates an existing API error when the language changes', async () => {
    render(<Alert error={{ code: 'INVALID_CREDENTIALS' }} />, {
      wrapper: MemoryRouter,
    })
    expect(screen.getByText(en.errors.invalidCredentials)).toBeInTheDocument()

    await act(() => i18n.changeLanguage('hu'))

    expect(screen.getByText(hu.errors.invalidCredentials)).toBeInTheDocument()
    expect(
      screen.queryByText(en.errors.invalidCredentials),
    ).not.toBeInTheDocument()
  })

  it('should display the error text correctly', () => {
    render(
      <Alert message="An error occurred" error="Detailed error message" />,
      { wrapper: MemoryRouter },
    )

    expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
    expect(screen.getByText(/detailed error message/i)).toBeInTheDocument()
  })

  it('should not render error message if not provided', () => {
    render(<Alert message="An error occurred" />, { wrapper: MemoryRouter })

    expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/detailed error message/i),
    ).not.toBeInTheDocument()
  })
})
