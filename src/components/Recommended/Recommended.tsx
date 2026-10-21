import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useBooksByPropertyQuery } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { booksSelector } from '@/store/selectors'
import { Card } from '@/components/Card'
import { SwiperComponent } from '@/components/SwiperComponent'
import { useAppSelector } from '@/hooks/redux'
import { scrollToTop } from '@/helpers/scrollToTop'
import { StyledRecommended } from './Recommended.style'

export function Recommended() {
  const { t } = useTranslation()

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
      <h2>{t('home.recommended')}</h2>
      <SwiperComponent>
        {booksRecommended.map((book) => (
          <Card key={book.id} book={book} />
        ))}
      </SwiperComponent>
    </StyledRecommended>
  )
}
