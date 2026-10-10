import { useEffect } from 'react'
import { booksSelector } from '@/store'
import { useBooksByPropertyQuery } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { Card, SwiperComponent } from '@/components'
import { useAppSelector } from '@/hooks'
import { scrollToTop } from '@/helpers'
import { StyledRecommended } from './Recommended.style'

export function Recommended() {
  useBooksByPropertyQuery('recommended', {
    refetchOnMountOrArgChange: cacheTimes.featured,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })
  const { booksRecommended } = useAppSelector(booksSelector)

  useEffect(() => {
    scrollToTop()
  }, [])

  if (!booksRecommended.length) {
    return null
  }

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
