import { useTranslation } from 'react-i18next'
import { useNewsQuery } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { newsSelector } from '@/store/selectors'
import { SwiperComponent } from '@/components/SwiperComponent'
import { useAppSelector } from '@/hooks/redux'
import { StyledNews } from './News.style'
import { NewsCard } from './NewsCard'

export function News() {
  const { t } = useTranslation()

  useNewsQuery({
    refetchOnMountOrArgChange: cacheTimes.featured,
  })
  const { newsItems } = useAppSelector(newsSelector)

  if (!newsItems.length) {
    return null
  }

  return (
    <StyledNews>
      <h2>{t('home.news')}</h2>
      <SwiperComponent>
        {newsItems.map((newsItem) => (
          <NewsCard key={newsItem.id} {...newsItem} />
        ))}
      </SwiperComponent>
    </StyledNews>
  )
}
