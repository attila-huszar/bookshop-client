import styled from 'styled-components'

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
`
