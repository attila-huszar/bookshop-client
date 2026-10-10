import { newsSelector } from '@/store'
import { useNewsQuery } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { SwiperComponent } from '@/components'
import { useAppSelector } from '@/hooks'
import { StyledNews } from './News.style'
import { NewsCard } from './NewsCard'

export function News() {
  useNewsQuery({
    refetchOnMountOrArgChange: cacheTimes.featured,
  })
  const { newsItems } = useAppSelector(newsSelector)

  if (!newsItems.length) {
    return null
  }

  return (
    <StyledNews>
      <h2>News</h2>
      <SwiperComponent>
        {newsItems.map((newsItem) => (
          <NewsCard key={newsItem.id} {...newsItem} />
        ))}
      </SwiperComponent>
    </StyledNews>
  )
}
