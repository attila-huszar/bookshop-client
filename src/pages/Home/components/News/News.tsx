import { StyledNews } from './News.style'
import { NewsCard } from './NewsCard'
import { useAppSelector } from '@/hooks'
import { newsSelector } from '@/store'
import { SwiperComponent } from '@/components'

export function News() {
  const { newsItems } = useAppSelector(newsSelector)

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
