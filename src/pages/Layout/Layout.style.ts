import { styled } from 'styled-components'
import { visuallyHidden } from '@/styles/accessibility.styles'
import { media } from '@/styles/media.breakpoints'

export const StyledLayout = styled.div`
  --storefront-header-height: 7.5rem;
  --page-loading-height: calc(100dvh - var(--storefront-header-height));
  --page-loading-color: var(--color-on-surface);

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
    --storefront-header-height: 5rem;

    min-width: 100%;
    max-width: 100%;
    margin: 0;
  `}
`

export const SkipLink = styled.a`
  position: fixed;
  inset: 0.75rem auto auto 0.75rem;
  z-index: 5;
  padding: 0.625rem 0.875rem;
  border-radius: var(--border-radius);
  background: var(--color-primary);
  color: var(--color-on-primary);

  &:not(:focus) {
    ${visuallyHidden}
  }
`

export const MainContent = styled.main`
  scroll-margin-block-start: var(--storefront-header-height);
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
