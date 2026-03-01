import { useEffect } from 'react'
import { booksSelector } from '@/store'
import { Card, SwiperComponent } from '@/components'
import { useAppSelector } from '@/hooks'
import { scrollToTop } from '@/helpers'
import { StyledRecommended } from './Recommended.style'

export function Recommended() {
  const { booksRecommended } = useAppSelector(booksSelector)

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <StyledRecommended>
      <h2>Recommended for you</h2>
      <SwiperComponent>
        {booksRecommended.map((book) => (
          <Card key={book.id} book={book} />
        ))}
      </SwiperComponent>
    </StyledRecommended>
  )
}
