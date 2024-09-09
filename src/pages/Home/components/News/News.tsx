import { StyledNews } from './News.styles'
import { NewsCard } from './NewsCard'
import { useAppSelector } from 'hooks'
import { newsSelector } from 'store'
import { SwiperComponent } from 'components'

export function News() {
  const { newsArray } = useAppSelector(newsSelector)

  return (
    <StyledNews>
      <h2>News</h2>
      <SwiperComponent>
        {newsArray.map((newsItem) => (
          <NewsCard key={newsItem.id} {...newsItem} />
        ))}
      </SwiperComponent>
    </StyledNews>
  )
}
