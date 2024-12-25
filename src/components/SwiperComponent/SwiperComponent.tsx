import { register } from 'swiper/element/bundle'
import type { SwiperSlideProps, SwiperProps } from 'swiper/react'
import type { Book, News } from '@/types'

register()

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'swiper-container': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & SwiperProps,
        HTMLElement
      >
      'swiper-slide': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & SwiperSlideProps,
        HTMLElement
      >
    }
  }
}

type Swiper = {
  children: React.ReactElement<Book>[] | React.ReactElement<News>[]
}

export function SwiperComponent({ children }: Swiper) {
  return (
    <swiper-container
      navigation={true}
      slides-per-view="auto"
      space-between="50">
      {children.map((child, idx) => (
        <swiper-slide key={idx} style={{ width: 'fit-content' }}>
          {child}
        </swiper-slide>
      ))}
    </swiper-container>
  )
}
