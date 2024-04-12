import { StyledNewsCard, Details, ImageWrap } from './NewsCard.styles'
import { INewsCardProps } from '../../../../interfaces'

export function NewsCard({ title, content, img }: INewsCardProps) {
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
