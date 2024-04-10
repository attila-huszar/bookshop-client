import { useAppSelector } from '../../hooks'
import { booksSelector } from '../../store/selectors'
import { StyledRecommended } from './Recommended.styles'
import { Card } from '../../components'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import '../../../node_modules/swiper/swiper.css'
import '../../../node_modules/swiper/modules/navigation.css'

export function Recommended() {
  const { randomBooks } = useAppSelector(booksSelector)

  return (
    <StyledRecommended>
      <h2>Recommended for you</h2>
      <Swiper
        modules={[Navigation]}
        navigation={true}
        slidesPerView={'auto'}
        spaceBetween={50}>
        {randomBooks.map((book) => (
          <SwiperSlide key={book.id} style={{ width: 'fit-content' }}>
            <Card {...book} />
          </SwiperSlide>
        ))}
      </Swiper>
    </StyledRecommended>
  )
}
