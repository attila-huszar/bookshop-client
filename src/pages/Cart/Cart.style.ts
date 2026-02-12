import { styled } from 'styled-components'

export const StyledCart = styled.main`
  padding: 0 10rem;

  h2 {
    margin-bottom: 2rem;
  }
`

export const CartGrid = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 8fr 2fr 2fr 2fr 1fr;
  align-items: center;
  column-gap: 0.5rem;
  row-gap: 1.5rem;
  min-width: 38rem;
`

export const LabelQuantity = styled.p`
  text-align: center;
`
export const LabelPrice = styled.p`
  margin-right: 1rem;
  text-align: right;
`

export const Book = styled.div`
  grid-column: 1/2;

  a {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-right: clamp(0.125rem, 2vw, 5rem);
    font-size: 1.125rem;

    &:hover {
      border-radius: var(--border-radius);
      background-color: var(--secondary-hover);
    }
  }

  &:not(:nth-child(5))::before {
    content: '';
    display: block;
    position: absolute;
    margin-top: -0.75rem;
    height: 1px;
    width: 100%;
    background-color: var(--light-grey);
  }
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
`

export const PriceItem = styled.div`
  grid-column: 3/4;
  display: flex;
  justify-content: end;
`

export const PriceTotal = styled.div`
  grid-column: 4/5;
  display: flex;
  justify-content: end;
`

export const RemoveItem = styled.div`
  grid-column: 5/6;
  display: flex;
  justify-content: end;
`

export const TotalPrice = styled.div`
  min-width: 38rem;
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
`

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
  flex-wrap: wrap;
  gap: 2rem;
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
