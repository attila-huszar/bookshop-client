import { StyledNewsCard, Details, ImageWrap } from './NewsCard.style'
import type { News } from '@/types'

export function NewsCard({ title, content, img }: News) {
  return (
    <StyledNewsCard>
      <Details>
        <h3>{title}</h3>
        <div></div>
        <p>{content}</p>
      </Details>
      <ImageWrap>
        <img src={img} alt={title} />
      </ImageWrap>
    </StyledNewsCard>
  )
}
