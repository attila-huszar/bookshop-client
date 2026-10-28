import { useTranslation } from 'react-i18next'
import { useNewsQuery } from '@/store/api/newsApi'
import { SwiperComponent } from '@/components/SwiperComponent'
import { CacheTime } from '@/constants/cacheTimes'
import { StyledNews } from './News.style'
import { NewsCard } from './NewsCard'

export function News() {
  const { t } = useTranslation()

  const { data: newsItems = [] } = useNewsQuery(undefined, {
    refetchOnMountOrArgChange: CacheTime.FifteenMinutes,
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
