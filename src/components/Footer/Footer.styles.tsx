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

  a:hover {
    color: var(--primary-color);
  }
`

export const LeftSection = styled.section`
  grid-area: 1 / 1 / 2 / 2;
`

export const RightSection = styled.section`
  grid-area: 1 / 2 / 2 / 3;
  padding: 4.75rem 2.5rem;

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
  gap: 2rem;
  list-style-type: none;
`
