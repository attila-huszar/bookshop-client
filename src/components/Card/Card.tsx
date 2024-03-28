import {
  StyledCard,
  CardDetails,
  CardImage,
  CardText,
  CardGreyText,
  CardPriceStrikethrough,
} from './Card.styles'
import { Button } from '../../components'
import imagePlaceholder from '../../assets/svg/image_placeholder.svg'
import cartIcon from '../../assets/svg/cart.svg'

export function Card() {
  return (
    <StyledCard>
      <CardImage
        src=""
        onError={(e) => ((e.target as HTMLImageElement).src = imagePlaceholder)}
        alt=""></CardImage>
      <CardDetails>
        <CardText>The Time Has Come</CardText>
        <CardGreyText>
          Lindbergh's Pharmacy is an Athens, Georgia, institution...
        </CardGreyText>
        <CardText>
          <span>$ 27.89</span>
          <CardPriceStrikethrough>$ 30.99</CardPriceStrikethrough>
        </CardText>
        <Button onClick={() => {}}>
          <img src={cartIcon} />
          Add to basket
        </Button>
      </CardDetails>
    </StyledCard>
  )
}
