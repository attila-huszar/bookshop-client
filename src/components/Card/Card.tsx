import {
  StyledCard,
  Details,
  Image,
  Title,
  Description,
  PriceBeforeDiscount,
} from './Card.styles'
import { Button } from '../../components'
import { ICard } from '../../interfaces/ICard'
import imagePlaceholder from '../../assets/svg/image_placeholder.svg'
import cartIcon from '../../assets/svg/cart.svg'

export function Card({ title, description, price, discount, imgUrl }: ICard) {
  return (
    <StyledCard>
      <Image
        src={imgUrl}
        onError={(e) => ((e.target as HTMLImageElement).src = imagePlaceholder)}
        alt={title}></Image>
      <Details>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <Title>
          {discount ? (
            <>
              <span>
                ${' '}
                {(Number(price) - (Number(price) * discount) / 100).toFixed(2)}
              </span>
              <PriceBeforeDiscount>$ {price}</PriceBeforeDiscount>
            </>
          ) : (
            <span>$ {price}</span>
          )}
        </Title>
        <Button onClick={() => {}} size="lg">
          <img src={cartIcon} />
          Add to basket
        </Button>
      </Details>
    </StyledCard>
  )
}
