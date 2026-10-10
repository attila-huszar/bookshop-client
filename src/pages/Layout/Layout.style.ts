import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledLayout = styled.div`
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  min-width: var(--min-width);
  max-width: var(--max-width);
  margin: 0 auto;
  border-bottom-left-radius: var(--corner-cut);
  border-bottom-right-radius: var(--corner-cut);
  background-color: var(--color-surface-bright);

  ${media.down('sm')`
    min-width: 100%;
    max-width: 100%;
    margin: 0;
  `}
`

export const PageShadow = styled.div`
  position: absolute;
  inset: -1rem;
  z-index: -1;
  pointer-events: none;
  border-radius: inherit;
  mask-image: linear-gradient(
    to bottom,
    transparent 2.5rem,
    var(--color-mask-opaque) min(70vh, 32rem)
  );

  &::before {
    content: '';
    position: absolute;
    inset: 1rem;
    border-radius: inherit;
    box-shadow: var(--shadow-page);
  }
`
