import { styled } from 'styled-components'
import { media } from './media.breakpoints'

export const StyledDialog = styled.dialog`
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32rem;
  padding: 1.5rem 2rem;
  border: none;
  border-radius: 10px;
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
    rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;

  ${media.down('sm')`
    width: 85%;
    padding: 1.5rem 1rem;
  `}
`
