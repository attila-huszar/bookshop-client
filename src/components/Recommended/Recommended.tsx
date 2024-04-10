import { useAppSelector } from '../../hooks'
import { booksSelector } from '../../store'
import { StyledRecommended } from './Recommended.styles'
import { Card } from '../../components'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

export function Recommended() {
  const { booksRandomize } = useAppSelector(booksSelector)

  return (
    <StyledRecommended>
      <h2>Recommended for you</h2>
      <Swiper
        modules={[Navigation]}
        navigation={true}
        slidesPerView={'auto'}
        spaceBetween={50}>
        {booksRandomize.map((book) => (
          <SwiperSlide key={book.id} style={{ width: 'fit-content' }}>
            <Card {...book} />
          </SwiperSlide>
        ))}
      </Swiper>
    </StyledRecommended>
  )
}
