import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { ROUTE } from '@/routes/route'
import { booksApi, useBooksByPropertyQuery } from '@/store/api/booksApi'
import { booksQueryArgs } from '@/store/selectors'
import { Button } from '@/components/Button'
import { useAppSelector } from '@/hooks/redux'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { CacheTime } from '@/constants/cacheTimes'
import {
  ImageItem,
  ImageWrapper,
  MirrorImg,
  MobileImageCard,
  MobileImageWrapper,
  StyledReleases,
  Welcome,
} from './Releases.style'

export function Releases() {
  const { t } = useTranslation()
  const queryArgs = useAppSelector(booksQueryArgs)
  const prefetchBook = booksApi.usePrefetch('book', {
    ifOlderThan: CacheTime.FiveMinutes,
  })
  const prefetchBooks = booksApi.usePrefetch('books', {
    ifOlderThan: CacheTime.FiveMinutes,
  })
  const prefetchOptions = booksApi.usePrefetch('searchOptions', {
    ifOlderThan: CacheTime.OneHour,
  })

  const prefetchShop = () => {
    prefetchBooks(queryArgs)
    prefetchOptions(undefined)
  }

  const { data: booksReleases = [] } = useBooksByPropertyQuery('newRelease', {
    refetchOnMountOrArgChange: CacheTime.FifteenMinutes,
  })
  const navigate = useNavigate()
  const { isMobile } = useBreakpoints()

  const featuredBooks = booksReleases.slice(0, 3)

  return (
    <StyledReleases>
      <Welcome>
        <h2>{t('home.releases')}</h2>
        <p>{t('home.releasesDescription')}</p>
        <Button
          onClick={() => void navigate(`/${ROUTE.BOOKS}`)}
          onMouseEnter={prefetchShop}
          onFocus={prefetchShop}
          $shadow
          $size="wide"
          $textSize="lg">
          {t('home.findBook')}
        </Button>
      </Welcome>
      {featuredBooks.length > 0 &&
        (isMobile ? (
          <MobileImageWrapper>
            {featuredBooks.map((book) => (
              <MobileImageCard key={book.id}>
                <Link
                  to={`/${ROUTE.BOOK}?id=${book.id}`}
                  onMouseEnter={() => prefetchBook(book.id)}
                  onFocus={() => prefetchBook(book.id)}>
                  <img src={book.imgUrl} alt={book.title} />
                  <p>{book.title}</p>
                </Link>
              </MobileImageCard>
            ))}
          </MobileImageWrapper>
        ) : (
          <ImageWrapper>
            {featuredBooks.map((book, idx) => (
              <ImageItem key={book.id} $idx={idx}>
                <Link
                  to={`/${ROUTE.BOOK}?id=${book.id}`}
                  onMouseEnter={() => prefetchBook(book.id)}
                  onFocus={() => prefetchBook(book.id)}>
                  <img src={book.imgUrl} alt={book.title} />
                </Link>
                <MirrorImg>
                  <img src={book.imgUrl} alt={book.title} aria-hidden="true" />
                </MirrorImg>
              </ImageItem>
            ))}
          </ImageWrapper>
        ))}
    </StyledReleases>
  )
}
