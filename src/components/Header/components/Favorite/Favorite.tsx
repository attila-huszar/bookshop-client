import styled from 'styled-components'
import favoriteIcon from '../../../../assets/svg/favorite.svg'

const StyledImage = styled.img``

export function Favorite() {
  return <StyledImage src={favoriteIcon} alt="favorite" />
}
