import { styled } from 'styled-components'
import { media } from './media.breakpoints'

export const StyledDialog = styled.dialog`
  position: fixed;
  inset: 0;
  margin: auto;
  height: fit-content;
  width: 32rem;
  padding: 1.5rem 2rem;
  border: none;
  border-radius: 10px;
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface);
  box-shadow: var(--shadow-raised);

  ${media.down('sm')`
    width: 85%;
    padding: 1.5rem 1rem;
  `}
`
