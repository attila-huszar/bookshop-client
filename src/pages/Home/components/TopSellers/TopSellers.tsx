import { useAppSelector } from '../../../../hooks'
import { booksTopSellersSelector } from '../../../../store/selectors'
import { SwiperComponent } from '../../../../components'
import { StyledTopSellers } from './TopSellers.styles'
import { Card } from '../../../../components'

export function TopSellers() {
  const bookTopSellers = useAppSelector(booksTopSellersSelector)

  return (
    <StyledTopSellers>
      <h2>Top Sellers</h2>
      <SwiperComponent>
        {bookTopSellers.map((book) => (
          <Card key={book.id} {...book} />
        ))}
      </SwiperComponent>
    </StyledTopSellers>
  )
}
