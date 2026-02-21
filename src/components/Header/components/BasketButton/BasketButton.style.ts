import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledBasketButton = styled.div`
  position: relative;
`

export const CartItemCount = styled.div`
  position: absolute;
  top: -0.75rem;
  right: -0.75rem;
  width: 2rem;
  padding: 0.25rem 0;
  font-size: 0.875rem;
  font-weight: bold;
  text-align: center;
  line-height: normal;
  border-radius: 10px;
  color: white;
  background-color: var(--orange);
  z-index: 6;

  ${media.down('sm')`
    top: -0.5rem;
    right: -0.5rem;
    width: 1.5rem;
    font-size: 0.75rem;
  `}
`
