import { styled } from 'styled-components'

export const StyledAuthorizationMenu = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 6.25rem 4rem;

  form {
    width: 30rem;

    > div {
      margin-bottom: 1rem;
    }
  }
`

export const FormChangeLinks = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 30rem;
  margin-bottom: 2rem;

  a {
    padding: 0.5rem 1.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    border-radius: 10px;
    transition: color 0.2s ease-out;
  }

  a:hover {
    color: var(--secondary-color);
  }

  a.active {
    background-color: var(--light-grey);
  }
`
