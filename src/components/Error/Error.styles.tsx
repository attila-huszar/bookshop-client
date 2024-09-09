import styled from 'styled-components'

export const StyledError = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem 4rem;
  color: var(--black);

  p {
    margin-bottom: 0.5rem;
    text-align: center;
    text-wrap: balance;
  }

  p:first-child {
    font-size: 1.25rem;
    font-weight: 700;
  }

  p:empty::before {
    content: '';
    display: inline-block;
  }

  > svg {
    height: 5rem;
  }
`
