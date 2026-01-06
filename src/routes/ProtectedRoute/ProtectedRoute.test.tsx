import { MockedFunction, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLoaderData } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'

vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useLoaderData: vi.fn(),
  }
})

describe('ProtectedRoute', () => {
  it('should render the Outlet when user is logged in', () => {
    const mockUseLoaderData = useLoaderData as MockedFunction<
      typeof useLoaderData
    >
    mockUseLoaderData.mockReturnValue(true)

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute />}>
            <Route path="" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should navigate to login when user is not logged in', () => {
    const mockUseLoaderData = useLoaderData as MockedFunction<
      typeof useLoaderData
    >
    mockUseLoaderData.mockReturnValue(false)

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/protected" element={<ProtectedRoute />}>
            <Route path="" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
