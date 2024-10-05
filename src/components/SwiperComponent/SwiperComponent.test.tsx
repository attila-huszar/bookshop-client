import { render, screen } from '@testing-library/react'
import { SwiperComponent } from './SwiperComponent'

describe('SwiperComponent', () => {
  it('should render the children inside Swiper slides', () => {
    const { container } = render(
      <SwiperComponent>
        <div>Slide 1</div>
        <div>Slide 2</div>
        <div>Slide 3</div>
      </SwiperComponent>,
    )

    expect(container.getElementsByClassName('swiper-slide').length).toBe(3)
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
    expect(screen.getByText('Slide 3')).toBeInTheDocument()
  })
})
