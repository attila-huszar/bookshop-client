import { styled } from 'styled-components'
import { media } from '@/styles/media.breakpoints'

export const StyledLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 3rem;
  padding-block: 1rem;

  ${media.down('sm')`
     gap: 1.5rem;
     flex-direction: column;
     padding-block: 0;
  `}
`

export const NavList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  min-inline-size: 0;
  gap: 0.5rem 1.5rem;
  font-size: 0.875rem;
  text-align: center;
  list-style-type: none;

  ${media.down('sm')`
    flex-direction: column;
  `}
`

export const SocialsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  margin-inline-start: auto;

  a {
    display: flex;
    align-content: center;
  }

  ${media.down('sm')`
    margin-inline-start: 0;
  `}
`
