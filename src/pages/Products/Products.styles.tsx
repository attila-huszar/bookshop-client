import styled from 'styled-components'

export const StyledProducts = styled.main`
  min-width: 56rem;
  max-width: 104rem;
  padding: 2rem 6.25rem 4rem;
  display: flex;

  & > div {
    display: flex;
    flex-wrap: wrap;
    gap: 2.5rem;
  }
`
