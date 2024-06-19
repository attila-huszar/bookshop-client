import styled from 'styled-components'

export const StyledProducts = styled.main`
  padding: 2rem 6.25rem 4rem;
  display: flex;
  justify-content: space-between;

  > section {
    width: 100%;
  }

  > section > div {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    min-width: 31.5rem;
  }
`
