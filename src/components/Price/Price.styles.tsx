import styled from 'styled-components'

export const StyledPriceCard = styled.p`
  font-size: 1.125rem;
`

export const StyledPriceProduct = styled.p`
  font-size: 1.25rem;
  grid-column: 3 / 4;
  grid-row: 1 / 3;
  align-self: center;
`

export const Currency = styled.span`
  margin-right: 0.5rem;
`

export const Strikethrough = styled.span`
  position: relative;
  margin-left: 2rem;
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
