import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledCart = styled.main`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-inline: 6.25rem;

  ${media.down('sm')`
    padding-inline: 1.25rem;
  `}
`

export const CartGrid = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 8fr 2fr 2fr 2fr 1fr;
  align-items: center;
  column-gap: 0.5rem;
  row-gap: 1rem;
  min-width: 0;

  ${media.up('sm')`
    min-width: 38rem;
  `}

  ${media.down('sm')`
    grid-template-columns: auto auto auto auto;
    column-gap: 0.25rem;
  `}
`

export const HeaderRow = styled.div`
  display: contents;

  ${media.down('sm')`
    display: none;
  `}
`

export const LabelQuantity = styled.p`
  text-align: center;
`
export const LabelPrice = styled.p`
  margin-right: 1rem;
  text-align: right;
`

export const Book = styled.div<{ $hasSeparator: boolean }>`
  grid-column: 1/2;

  a {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-top: ${({ $hasSeparator }) => ($hasSeparator ? '1rem' : '0')};
    margin-right: clamp(0.125rem, 2vw, 5rem);
    font-size: 1.125rem;

    &:hover {
      border-radius: var(--border-radius);
      background-color: var(--secondary-hover);
    }
  }

  &::before {
    content: '';
    display: ${({ $hasSeparator }) => ($hasSeparator ? 'block' : 'none')};
    position: absolute;
    height: 1px;
    width: 100%;
    background-color: var(--light-grey);
  }

  ${media.down('sm')`
    grid-column: 1 / -1;

    a {
      margin-right: 0;
      gap: 1rem;
      font-size: 1rem;
    }
  `}
`

export const ImageWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  height: 7.5rem;
  width: 6rem;
  background-color: #f4f4ff;
  border: 1px solid #e5e5e5;
  border-radius: var(--border-radius);

  img {
    height: 6rem;
    width: 4.5rem;
    object-fit: cover;
    border-radius: var(--border-radius);
    box-shadow:
      rgba(0, 0, 0, 0.19) 0px 5px 10px,
      rgba(0, 0, 0, 0.23) 0px 3px 3px;
  }

  ${media.down('sm')`
    height: 6.75rem;
    width: 5.5rem;

    img {
      height: 5.5rem;
      width: 4rem;
    }
  `}
`

export const Quantity = styled.div`
  grid-column: 2/3;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  input {
    height: 2rem;
    width: 2.5rem;
    border-radius: var(--border-radius);
    font-size: 1rem;
    text-align: center;
  }

  ${media.down('sm')`
    grid-column: 1 / 2;
    justify-content: start;
  `}
`

export const PriceItem = styled.div`
  grid-column: 3/4;
  display: flex;
  justify-content: end;

  ${media.down('sm')`
    grid-column: 2 / 3;
    justify-content: end;
  `}
`

export const PriceTotal = styled.div`
  grid-column: 4/5;
  display: flex;
  justify-content: end;

  ${media.down('sm')`
    grid-column: 3 / 4;
  `}
`

export const RemoveItem = styled.div`
  grid-column: 5/6;
  display: flex;
  justify-content: end;

  ${media.down('sm')`
    grid-column: 4 / 5;
  `}
`

export const TotalPrice = styled.div`
  min-width: 0;
  width: 100%;
  margin: 2rem 0;
  padding: 1rem 2rem;
  border-radius: 10px;
  background-color: var(--pearly-white);
  text-align: right;

  div {
    display: grid;
    grid-template-columns: 1fr minmax(6.5rem, max-content);
    justify-content: end;
    column-gap: 1rem;
  }

  h3 {
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    font-size: 1.25rem;
    border-bottom: 1px solid var(--light-grey);
  }

  h4 {
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 1.25rem;
    font-weight: 700;
  }

  ${media.up('sm')`
    min-width: 38rem;
  `}

  ${media.down('sm')`
    padding: 1rem;

    div {
      column-gap: 0.5rem;
    }
  `}
`

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
  flex-wrap: wrap;
  gap: 1.25rem;

  ${media.down('sm')`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.75rem;
    width: 100%;

    > *:first-child {
      width: 100%;
    }

    > *:last-child {
      grid-column: 1 / -1;
      width: 100%;
    }
  `}
`

export const EmptyCart = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--grey);

  > svg {
    height: 10rem;
  }
`
