import styled from 'styled-components'
import menuIcon from '../../../../assets/svg/menu.svg'

const StyledImage = styled.img`
  margin-right: 5vw;
`

export function Menu() {
  return <StyledImage src={menuIcon} alt="menu" />
}
