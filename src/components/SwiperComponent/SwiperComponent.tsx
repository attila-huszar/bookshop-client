import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import type { Book, News } from '@/types'
import 'swiper/css'
import 'swiper/css/navigation'

type SwiperProps = {
  children: React.ReactElement<Book>[] | React.ReactElement<News>[]
}

export function SwiperComponent({ children }: SwiperProps) {
  return (
    <Swiper
      modules={[Navigation]}
      navigation={true}
      slidesPerView={'auto'}
      spaceBetween={50}>
      {children.map((child, idx) => (
        <SwiperSlide key={idx} style={{ width: 'fit-content' }}>
          {child}
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
