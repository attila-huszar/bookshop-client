import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import { Card } from '..'
import { IBook } from '../../interfaces'
import 'swiper/css'
import 'swiper/css/navigation'

export function SwiperComponent({ books }: { books: IBook[] }) {
  return (
    <Swiper
      modules={[Navigation]}
      navigation={true}
      slidesPerView={'auto'}
      spaceBetween={50}>
      {books.map((book) => (
        <SwiperSlide key={book.id} style={{ width: 'fit-content' }}>
          <Card {...book} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
