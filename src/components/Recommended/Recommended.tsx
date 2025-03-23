import { useEffect } from 'react'
import { StyledRecommended } from './Recommended.style'
import { useAppSelector } from '@/hooks'
import { booksSelector } from '@/store'
import { Card, SwiperComponent } from '@/components'

export function Recommended() {
  const { booksRecommended } = useAppSelector(booksSelector)

  useEffect(() => {
    window.scrollTo(0, 0)
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
