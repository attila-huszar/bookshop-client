import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { ROUTE } from '@/routes/route'
import { useBooksByPropertyQuery } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { Button } from '@/components/Button'
import { useBreakpoints } from '@/hooks/useBreakpoints'
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

  const { data: booksReleases = [] } = useBooksByPropertyQuery('newRelease', {
    refetchOnMountOrArgChange: cacheTimes.featured,
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
                <Link to={`/${ROUTE.BOOK}?id=${book.id}`}>
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
                <Link to={`/${ROUTE.BOOK}?id=${book.id}`}>
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
