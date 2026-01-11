import { booksSelector } from '@/store'
import { Card, SwiperComponent } from '@/components'
import { useAppSelector } from '@/hooks'
import { StyledTopSellers } from './TopSellers.style'

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
