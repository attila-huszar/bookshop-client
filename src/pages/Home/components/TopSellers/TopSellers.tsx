import { StyledTopSellers } from './TopSellers.styles'
import { useAppSelector } from '@/hooks'
import { booksSelector } from '@/store'
import { Card, SwiperComponent } from '@/components'

export function TopSellers() {
  const { booksTopSellers } = useAppSelector(booksSelector)

  return (
    <StyledTopSellers>
      <h2>Top Sellers</h2>
      <SwiperComponent>
        {booksTopSellers.map((book) => (
          <Card key={book.id} book={book} />
        ))}
      </SwiperComponent>
    </StyledTopSellers>
  )
}
