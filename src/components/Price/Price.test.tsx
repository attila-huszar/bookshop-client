import { i18n } from '@/i18n'
import { act, render, screen } from '@testing-library/react'
import { Price } from './Price'

const defaultProps = {
  component: 'card' as const,
  price: 100,
  discount: 0,
}

describe('Price Component', () => {
  it('multiplies the rounded discounted unit price when displaying a line total', () => {
    render(<Price component="cart" price={9.99} discount={20} quantity={100} />)

    expect(screen.getByText('799')).toBeInTheDocument()
    expect(screen.getByText('999')).toBeInTheDocument()
    expect(screen.queryByText('799.20')).not.toBeInTheDocument()
  })

  it('updates decimal formatting when the interface language changes', async () => {
    render(<Price {...defaultProps} price={12.5} />)

    expect(screen.getByText('12.50')).toBeInTheDocument()

    await act(async () => {
      await i18n.changeLanguage('hu')
    })

    expect(screen.getByText('12,50')).toBeInTheDocument()
  })

  it('should render without discount in card component', () => {
    render(<Price {...defaultProps} />)

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.queryByText(/del/i)).not.toBeInTheDocument()
  })

  it('should render with discount in product component', () => {
    render(<Price {...defaultProps} component="product" discount={20} />)

    expect(screen.getByText('80')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })
})
