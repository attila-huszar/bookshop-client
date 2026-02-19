import { Link, useNavigate } from 'react-router'
import { ROUTE } from '@/routes'
import { booksSelector } from '@/store'
import { Button } from '@/components'
import { useAppSelector, useBreakpoints } from '@/hooks'
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
  const navigate = useNavigate()
  const { booksReleases } = useAppSelector(booksSelector)
  const { isMobile } = useBreakpoints()

  const featuredBooks = booksReleases.slice(0, 3)

  return (
    <StyledReleases>
      <Welcome>
        <h2>New Releases This Week</h2>
        <p>
          It's time to update your reading list with some of the latest and
          greatest releases in the literary world. From heart-pumping thrillers
          to captivating memoirs, this week's new releases offer something for
          everyone.
        </p>
        <Button
          onClick={() => void navigate(`/${ROUTE.BOOKS}`)}
          $shadow
          $size="wide"
          $textSize="lg">
          Find Your Next Read
        </Button>
      </Welcome>
      {isMobile ? (
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
      )}
    </StyledReleases>
  )
}
