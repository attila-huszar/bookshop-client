import { useAppSelector } from '../../../../hooks'
import { booksSelector } from '../../../../store'
import {
  StyledReleases,
  ImageWrapper,
  OriginalImg,
  MirroredImg,
} from './Releases.styles'
import { Button } from '../../../../components'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

export function Releases() {
  const { booksReleases } = useAppSelector(booksSelector)

  return (
    <StyledReleases>
      <div>
        <h1>New Releases This Week</h1>
        <p>
          It's time to update your reading list with some of the latest and
          greatest releases in the literary world. From heart-pumping thrillers
          to captivating memoirs, this week's new releases offer something for
          everyone.
        </p>
        <Button onClick={() => {}} $shadowed $size="wide" $textSize="lg">
          Subscribe
        </Button>
      </div>
      <div>
        <Swiper slidesPerView={'auto'}>
          {booksReleases.map((book) => (
            <SwiperSlide key={book.id} style={{ width: 'fit-content' }}>
              <ImageWrapper>
                <OriginalImg>
                  <img src={book.imgUrl} alt={book.title} height="100%" />
                  <MirroredImg>
                    <img src={book.imgUrl} alt={book.title} height="100%" />
                  </MirroredImg>
                </OriginalImg>
              </ImageWrapper>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </StyledReleases>
  )
}
