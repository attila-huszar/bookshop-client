import { News } from '@/types'
import { Details, ImageWrap, StyledNewsCard } from './NewsCard.style'

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
