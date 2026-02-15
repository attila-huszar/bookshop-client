import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledHeader = styled.header`
  position: sticky;
  top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  height: 6rem;
  width: 100%;
  min-width: var(--min-width);
  max-width: var(--max-width);
  padding: 0 6.25rem;
  background-color: #ffffff85;
  backdrop-filter: blur(10px);
  z-index: 3;

  ${media.down('sm')`
    min-width: 100%;
    max-width: 100%;
    padding: 0 1rem;
  `}
`
