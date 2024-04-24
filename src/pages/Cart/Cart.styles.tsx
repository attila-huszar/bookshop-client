import styled from 'styled-components'

export const StyledCart = styled.main`
  padding: 0 10rem;

  h2 {
    margin-bottom: 2rem;
  }
`

export const CartItem = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 6rem 4fr max-content max-content max-content 1fr 1fr 4rem;
  column-gap: 1rem;
  height: 6rem;
  min-width: 38rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--light-grey);
  }

  a {
    justify-self: center;
    align-content: center;
    height: 5rem;
    font-size: 1.125rem;

    img {
      height: 100%;
    }
  }

  button {
    justify-self: end;
  }
`

export const Quantity = styled.input`
  height: 2rem;
  width: 2.5rem;
  border-radius: 5px;
  font-size: 1rem;
  text-align: center;
`

export const TotalPrice = styled.div`
  min-width: 38rem;
  margin: 2rem 0;
  padding: 1rem 2rem;
  border-radius: 10px;
  background-color: var(--whitesmoke);

  h3 {
    border-bottom: 1px solid var(--light-grey);
  }

  h3,
  h4 {
    text-align: right;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.25rem;
    font-weight: 700;
    text-align: right;
  }
`

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
  flex-wrap: wrap;
  gap: 3rem;
`
