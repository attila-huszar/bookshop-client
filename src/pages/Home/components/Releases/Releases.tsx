import { Link } from 'react-router'
import {
  StyledReleases,
  Welcome,
  ImageWrapper,
  ImageItem,
  MirrorImg,
} from './Releases.style'
import { useAppSelector } from '@/hooks'
import { booksSelector } from '@/store'
import { Button } from '@/components'
import { ROUTE } from '@/routes'

export function Releases() {
  const { booksReleases } = useAppSelector(booksSelector)

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

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
        <Button onClick={scrollToBottom} $shadowed $size="wide" $textSize="lg">
          Subscribe
        </Button>
      </Welcome>
      <ImageWrapper>
        {booksReleases.map((book, idx) => (
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
    </StyledReleases>
  )
}
