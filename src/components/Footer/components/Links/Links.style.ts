import { styled } from 'styled-components'

export const StyledLinks = styled.div`
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 3rem;
`

export const NavList = styled.ul`
  display: flex;
  column-gap: 1.5rem;
  font-size: 0.875rem;
  text-align: center;
  list-style-type: none;
`

export const SocialsList = styled.div`
  display: flex;
  gap: 3rem;

  a {
    display: flex;
    align-content: center;
  }
`
