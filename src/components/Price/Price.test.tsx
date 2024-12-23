import { render, screen } from '@testing-library/react'
import { Price } from './Price'
import type { PriceProps } from '@/types'

const defaultProps: PriceProps = {
  component: 'card',
  price: 100,
  discount: 0,
}

describe('Price Component', () => {
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
