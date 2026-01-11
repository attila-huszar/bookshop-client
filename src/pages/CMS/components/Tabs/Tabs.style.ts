import { styled } from 'styled-components'

export const StyledTabs = styled.div`
  display: flex;
  max-width: var(--max-width);
  border-bottom: 1px solid #eee;

  a {
    flex: 1;
    padding: 0.5rem;
    background-color: var(--white);
    font-weight: 600;
    text-align: center;
    color: var(--dark-grey);
    border-radius: 10px 10px 0 0;
    transition:
      color 0.2s ease-out,
      background-color 0.2s ease-out;
  }

  a.active {
    color: var(--black);
    background-color: var(--secondary-color);
    border-bottom: 2px solid var(--secondary-dark);
  }

  a:not(.active):hover {
    color: var(--black);
    background: var(--secondary-hover);
  }
`
