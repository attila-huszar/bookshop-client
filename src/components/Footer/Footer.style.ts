import { styled } from 'styled-components'

export const StyledFooter = styled.footer`
  display: grid;
  grid-template-rows: 16rem 3.5rem;
  grid-template-columns: 1fr 1fr;
  column-gap: 2.5rem;
  width: 100%;
  min-width: var(--min-width);
  max-width: var(--max-width);
  padding: 0 6.25rem;

  a:hover {
    color: var(--primary-color);
  }
`

export const LeftSection = styled.section`
  grid-area: 1 / 1 / 2 / 2;
  align-self: center;
`

export const RightSection = styled.section`
  grid-area: 1 / 2 / 2 / 3;
  align-self: center;

  p {
    text-wrap: balance;
  }
`

export const BottomSection = styled.section`
  grid-area: 2 / 1 / 3 / 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px #0d08421a solid;
`

export const NavList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  min-width: 14rem;
  gap: 2rem;
  list-style-type: none;
`
