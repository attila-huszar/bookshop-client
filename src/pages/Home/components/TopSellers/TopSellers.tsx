import { booksSelector } from '@/store'
import { useBooksByPropertyQuery } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { Card, SwiperComponent } from '@/components'
import { useAppSelector } from '@/hooks'
import { StyledTopSellers } from './TopSellers.style'

export function TopSellers() {
  useBooksByPropertyQuery('topSellers', {
    refetchOnMountOrArgChange: cacheTimes.featured,
  })
  const { booksTopSellers } = useAppSelector(booksSelector)

  if (!booksTopSellers.length) {
    return null
  }

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
