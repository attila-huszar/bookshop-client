import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import type { Book, News } from '@/types'
//@ts-expect-error swiper css import alias issue
import 'swiper/css'
//@ts-expect-error swiper css import alias issue
import 'swiper/css/navigation'

type Props = {
  children: React.ReactElement<Book>[] | React.ReactElement<News>[]
}

export function SwiperComponent({ children }: Props) {
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
