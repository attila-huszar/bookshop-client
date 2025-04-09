import { styled } from 'styled-components'

export const StyledProducts = styled.main`
  padding: 0 5rem 4rem;
  display: flex;
  justify-content: space-between;

  > section {
    width: 100%;
  }

  > section > div {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5rem;
    row-gap: 2rem;
    min-width: 31.5rem;
  }
`
