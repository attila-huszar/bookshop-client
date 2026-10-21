import { useTranslation } from 'react-i18next'
import { useNewsQuery } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { SwiperComponent } from '@/components/SwiperComponent'
import { StyledNews } from './News.style'
import { NewsCard } from './NewsCard'

export function News() {
  const { t } = useTranslation()

  const { data: newsItems = [] } = useNewsQuery({
    refetchOnMountOrArgChange: cacheTimes.featured,
  })

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
