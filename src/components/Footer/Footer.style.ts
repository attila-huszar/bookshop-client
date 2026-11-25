import { styled } from 'styled-components'
import { media } from '@/styles/media.breakpoints'

export const StyledFooter = styled.footer`
  display: grid;
  grid-template-rows: 16rem 3.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 2.5rem;
  width: 100%;
  max-width: var(--max-width);
  padding: 0 6.25rem;

  a:hover {
    color: var(--color-primary);
  }

  ${media.down('md')`
    padding-inline: 1.5rem;
  `}

  ${media.down('sm')`
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
    border-top: 1px var(--color-outline-variant) solid;
  `}
`
