import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useBooksByPropertyQuery } from '@/store/api/booksApi'
import { Card } from '@/components/Card'
import { SwiperComponent } from '@/components/SwiperComponent'
import { scrollToTop } from '@/helpers/scrollToTop'
import { CacheTime } from '@/constants/time'
import { StyledRecommended } from './Recommended.style'

export function Recommended({ skipQuery = false }: { skipQuery?: boolean }) {
  const { t } = useTranslation()

  const { data: booksRecommended = [] } = useBooksByPropertyQuery(
    'recommended',
    {
      skip: skipQuery,
      refetchOnMountOrArgChange: CacheTime.FifteenMinutes,
      refetchOnReconnect: false,
    },
  )

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
          <Card key={book.id} book={book} imageLoading="lazy" />
        ))}
      </SwiperComponent>
    </StyledRecommended>
  )
}
