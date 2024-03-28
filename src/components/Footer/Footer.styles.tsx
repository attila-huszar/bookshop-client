import styled from 'styled-components'

export const StyledFooter = styled.footer`
  position: absolute;
  bottom: 0;
  display: grid;
  grid-template-rows: 1fr 3.5rem;
  grid-template-columns: 1fr 1fr;
  height: 25rem;
  width: 100%;
  max-width: 90rem;
  padding: 0 6.25rem;
`

export const FooterLeft = styled.div`
  grid-area: 1 / 1 / 2 / 2;
  padding: 3rem 0;
`

export const FooterRight = styled.div`
  grid-area: 1 / 2 / 2 / 3;
  padding: 4.75rem 2.5rem;
`

export const FooterBottom = styled.div`
  grid-area: 2 / 1 / 3 / 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px #0d08421a solid;
`

export const NavList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  list-style-type: none;
`
