import styled from 'styled-components'
import caret_left from '../../assets/svg/caret_left.svg'

export const StyledProduct = styled.main`
  padding: 0 6.25rem;
`

export const Breadcrumb = styled.nav`
  position: relative;
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;

  &::before {
    content: '';
    position: absolute;
    left: -2rem;
    height: 20px;
    width: 20px;
    background: url(${caret_left}) center no-repeat;
  }
`
