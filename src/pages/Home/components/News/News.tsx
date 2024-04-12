import { StyledNews } from './News.styles'
import { SwiperComponent } from '../../../../components'
import { NewsCard } from './NewsCard'
import newsItems from '../../../../lib/news.json'

export function News() {
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
