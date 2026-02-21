import { styled } from 'styled-components'
import { media } from '@/styles'

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

  ${media.down('sm')`
    min-width: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    padding: 2rem 1.5rem;
    gap: 2rem;
  `}
`

export const LeftSection = styled.section`
  grid-area: 1 / 1 / 2 / 2;
  align-self: center;
`

export const RightSection = styled.section`
  grid-area: 1 / 2 / 2 / 3;
  align-self: center;

  p {
    text-wrap: pretty;
  }
`

export const BottomSection = styled.section`
  grid-area: 2 / 1 / 3 / 3;

  ${media.up('sm')`
    border-top: 1px var(--light-grey) solid;
  `}
`
