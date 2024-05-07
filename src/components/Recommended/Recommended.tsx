import { useAppSelector } from '../../hooks'
import { booksSelector } from '../../store'
import { StyledRecommended } from './Recommended.styles'
import { SwiperComponent } from '..'
import { Card } from '../../components'

export function Recommended() {
  const { booksRandomized } = useAppSelector(booksSelector)

  return (
    <StyledRecommended>
      <h2>Recommended for you</h2>
      <SwiperComponent>
        {booksRandomized.map((book) => (
          <Card key={book.id} book={book} />
        ))}
      </SwiperComponent>
    </StyledRecommended>
  )
}
