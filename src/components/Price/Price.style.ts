import { styled } from 'styled-components'

export const StyledPriceCard = styled.div`
  font-size: 1.125rem;

  p {
    display: flex;
    gap: 2rem;
  }
`

export const StyledPriceProduct = styled.div`
  font-size: 1.25rem;
  grid-column: 3 / 4;
  grid-row: 1 / 3;
  align-self: center;

  p {
    display: flex;
    gap: 2rem;
  }
`

export const StyledPriceCart = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-right: 1rem;
  font-size: 1.125rem;

  p {
    display: grid;
    justify-items: end;
  }
`

export const Currency = styled.span`
  margin-right: 0.5rem;
`

export const Strikethrough = styled.span`
  position: relative;
  font-size: inherit;
  color: var(--grey);

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% + 1ch);
    border-bottom: 1px solid;
    pointer-events: none;
  }
`
