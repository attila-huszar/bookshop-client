import { StyledNewsCard, Details, ImageWrap } from './NewsCard.styles'
import { INews } from 'interfaces'

export function NewsCard({ title, content, img }: INews) {
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
