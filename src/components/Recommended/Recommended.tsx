import { useAppSelector } from '../../hooks'
import { booksSelector } from '../../store'
import { StyledRecommended } from './Recommended.styles'
import { SwiperComponent } from '..'

export function Recommended() {
  const { booksRandomize } = useAppSelector(booksSelector)

  return (
    <StyledRecommended>
      <h2>Recommended for you</h2>
      <SwiperComponent books={booksRandomize} />
    </StyledRecommended>
  )
}
