import { Link } from 'react-router-dom'
import {
  StyledReleases,
  ImageWrapper,
  ImageItem,
  MirrorImg,
} from './Releases.styles'
import { useAppSelector } from 'hooks'
import { booksSelector } from 'store'
import { Button } from 'components'
import { PATH } from 'lib'

export function Releases() {
  const { booksReleases } = useAppSelector(booksSelector)

  return (
    <StyledReleases>
      <div>
        <h1>New Releases This Week</h1>
        <p>
          {
            "It's time to update your reading list with some of the latest and greatest releases in the literary world. From heart-pumping thrillers to captivating memoirs, this week's new releases offer something for everyone."
          }
        </p>
        <Button onClick={() => undefined} $shadowed $size="wide" $textSize="lg">
          Subscribe
        </Button>
      </div>
      <div>
        <ImageWrapper>
          {booksReleases.map((book, idx) => (
            <ImageItem key={book.id} $idx={idx}>
              <Link to={`/${PATH.books}/${book.id}`}>
                <img src={book.imgUrl} alt={book.title} />
              </Link>
              <MirrorImg>
                <img src={book.imgUrl} alt={book.title} aria-hidden="true" />
              </MirrorImg>
            </ImageItem>
          ))}
        </ImageWrapper>
      </div>
    </StyledReleases>
  )
}
