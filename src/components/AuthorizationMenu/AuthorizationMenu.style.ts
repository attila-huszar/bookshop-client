import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledAuthorizationMenu = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 6.25rem 4rem;
  width: 100%;

  ${media.down('sm')`
    padding: 2rem 1.5rem 4rem;
  `}

  form {
    width: min(100%, 30rem);

    > div {
      margin-bottom: 1rem;
    }
  }
`

export const FormChangeLinks = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: min(100%, 30rem);
  margin-bottom: 2rem;
  gap: 0.5rem;

  a {
    padding: 0.5rem 1.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    border-radius: 10px;
    transition: color 0.2s ease-out;
  }

  a:hover {
    color: var(--primary-color);
  }

  a.active {
    background-color: var(--light-grey);
  }

  ${media.down('sm')`
    a {
      padding: 0.5rem 1rem;
      font-size: 1.25rem;
    }
  `}
`
