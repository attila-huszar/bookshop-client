import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledLinks = styled.div`
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 3rem;

  ${media.down('sm')`
     gap: 1.5rem;
     flex-direction: column;
     justify-content: center;
  `}
`

export const NavList = styled.ul`
  display: flex;
  column-gap: 1.5rem;
  font-size: 0.875rem;
  text-align: center;
  list-style-type: none;

  ${media.down('sm')`
    flex-direction: column;
    row-gap: 0.5rem;
  `}
`

export const SocialsList = styled.div`
  display: flex;
  gap: 3rem;

  a {
    display: flex;
    align-content: center;
  }
`
