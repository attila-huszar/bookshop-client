import { useTranslation } from 'react-i18next'
import { useBooksByPropertyQuery } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { Card } from '@/components/Card'
import { SwiperComponent } from '@/components/SwiperComponent'
import { StyledTopSellers } from './TopSellers.style'

export function TopSellers() {
  const { t } = useTranslation()

  const { data: booksTopSellers = [] } = useBooksByPropertyQuery('topSellers', {
    refetchOnMountOrArgChange: cacheTimes.featured,
  })

  if (!booksTopSellers.length) {
    return null
  }

  return (
    <StyledTopSellers>
      <h2>{t('common.fields.topSellers')}</h2>
      <SwiperComponent>
        {booksTopSellers.map((book) => (
          <Card key={book.id} book={book} />
        ))}
      </SwiperComponent>
    </StyledTopSellers>
  )
}
