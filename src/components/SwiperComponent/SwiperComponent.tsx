import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { ISwiper } from 'interfaces'

export function SwiperComponent({ children }: ISwiper) {
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
