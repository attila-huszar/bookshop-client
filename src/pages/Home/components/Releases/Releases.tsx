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
import { PATH } from '@/constants'

export function Releases() {
  const { booksReleases } = useAppSelector(booksSelector)

  return (
    <StyledReleases>
      <Welcome>
        <h2>New Releases This Week</h2>
        <p>
          {
            "It's time to update your reading list with some of the latest and greatest releases in the literary world. From heart-pumping thrillers to captivating memoirs, this week's new releases offer something for everyone."
          }
        </p>
        <Button onClick={() => undefined} $shadowed $size="wide" $textSize="lg">
          Subscribe
        </Button>
      </Welcome>
      <ImageWrapper>
        {booksReleases.map((book, idx) => (
          <ImageItem key={book.id} $idx={idx}>
            <Link to={`/${PATH.CLIENT.books}/${book.id}`}>
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
