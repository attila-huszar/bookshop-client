import { StyledTopSellers } from './TopSellers.style'
import { useAppSelector } from '@/hooks'
import { booksSelector } from '@/store'
import { SwiperComponent } from '@/components'
import { Card } from '@/components/Card/Card'

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
