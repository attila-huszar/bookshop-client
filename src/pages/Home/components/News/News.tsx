import { StyledNews } from './News.styles'
import { NewsCard } from './NewsCard'
import { useAppSelector } from 'hooks'
import { newsSelector } from 'store'
import { Loading, Error, SwiperComponent } from 'components'

export function News() {
  const { newsData, newsIsLoading, newsError } = useAppSelector(newsSelector)

  if (newsIsLoading) {
    return <Loading />
  }

  if (newsError) {
    return <Error error={newsError} />
  }

  return (
    <StyledNews>
      <h2>News</h2>
      <SwiperComponent>
        {newsData.map((newsItem) => (
          <NewsCard key={newsItem.id} {...newsItem} />
        ))}
      </SwiperComponent>
    </StyledNews>
  )
}
