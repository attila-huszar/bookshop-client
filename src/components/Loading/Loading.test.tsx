import { render, screen } from '@testing-library/react'
import { StyledLayout } from '@/pages/Layout/Layout.style'
import { Loading } from './Loading'

describe('Loading Component', () => {
  it('shows the default message and accepts a custom message', () => {
    const { rerender } = render(<Loading />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    rerender(<Loading message="Please wait..." />)

    expect(screen.getByText(/please wait.../i)).toBeInTheDocument()
  })

  it('uses a contrasting foreground on the page frame and storefront', () => {
    render(
      <>
        <style>{`:root { --color-on-primary: #fff; --color-on-surface: #211a14; }`}</style>
        <Loading fullScreen message="Loading checkout" />
        <StyledLayout>
          <Loading fullScreen message="Loading books" />
        </StyledLayout>
      </>,
    )

    expect(screen.getByText('Loading checkout')).toHaveStyle({
      color: 'rgb(255, 255, 255)',
    })
    expect(screen.getByText('Loading books')).toHaveStyle({
      color: 'rgb(33, 26, 20)',
    })
  })
})
