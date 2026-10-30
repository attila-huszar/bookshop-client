import { styled } from 'styled-components'
import { media } from '@/styles/media.breakpoints'

export const StyledHeader = styled.header`
  --header-action-gap: 1.25rem;

  position: sticky;
  top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--header-action-gap);
  height: 6rem;
  width: 100%;
  min-width: var(--min-width);
  max-width: var(--max-width);
  padding: 0 6.25rem;
  background-color: color-mix(
    in srgb,
    var(--color-surface-bright) 85%,
    transparent
  );
  backdrop-filter: blur(10px);
  z-index: 3;

  ${media.down('sm')`
    --header-action-gap: 0.75rem;

    top: 1rem;
    height: 4rem;
    min-width: 100%;
    max-width: 100%;
    padding: 0 0.75rem;
  `}
`
