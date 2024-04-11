import { Link } from 'react-router-dom'
import { StyledCard, Details, Image, Title, Description } from './Card.styles'
import { Button, Price } from '../../components'
import { BOOKS } from '../../routes/routeConstants'
import { ICardProps } from '../../interfaces/'
import imagePlaceholder from '../../assets/svg/image_placeholder.svg'

export function Card({
  id,
  title,
  description,
  price,
  discount,
  imgUrl,
}: ICardProps) {
  return (
    <Link
      to={`${BOOKS}${id}`}
      onClick={() => {
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        })
      }}>
      <StyledCard>
        <Image
          src={imgUrl}
          onError={(e) =>
            ((e.target as HTMLImageElement).src = imagePlaceholder)
          }
          alt={title}></Image>
        <Details>
          <Title>{title}</Title>
          <Description>{description}</Description>
          <Price component="card" price={price} discount={discount} />
          <Button onClick={() => {}} $withCart $textSize="lg">
            Add to basket
          </Button>
        </Details>
      </StyledCard>
    </Link>
  )
}
