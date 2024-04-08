import {
  StyledCard,
  Details,
  Image,
  Title,
  Description,
  Currency,
  Price,
} from './Card.styles'
import { Strikethrough } from '../../styles/Shared.styles'
import { Button } from '../../components'
import { ICard } from '../../interfaces/ICard'
import imagePlaceholder from '../../assets/svg/image_placeholder.svg'
import cartIcon from '../../assets/svg/cart.svg'
import { Link } from 'react-router-dom'
import { BOOKS } from '../../routes/routeConstants'

export function Card({
  id,
  title,
  description,
  price,
  discount,
  imgUrl,
}: ICard) {
  return (
    <Link to={`${BOOKS}${id}`}>
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
          <Title>
            {discount ? (
              <>
                <Currency>$</Currency>
                <Price>
                  {(Number(price) - (Number(price) * discount) / 100).toFixed(
                    2,
                  )}
                </Price>
                <Strikethrough>
                  <Currency>$</Currency>
                  <Price>{price}</Price>
                </Strikethrough>
              </>
            ) : (
              <>
                <Currency>$</Currency>
                <Price>{price}</Price>
              </>
            )}
          </Title>
          <Button onClick={() => {}} $textSize="lg">
            <img src={cartIcon} />
            Add to basket
          </Button>
        </Details>
      </StyledCard>
    </Link>
  )
}
