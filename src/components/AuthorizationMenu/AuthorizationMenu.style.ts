import { styled } from 'styled-components'
import { StyledIconButton } from '@/components/Button/IconButton.style'
import { ButtonWrapper } from '@/styles/form.styles'
import { media } from '@/styles/media.breakpoints'

export const StyledAuthorizationMenu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 4rem 0;

  ${media.down('sm')`
    padding: 2rem 1.5rem;
  `}

  form {
    width: 100%;
    max-width: 30rem;

    > div {
      margin-bottom: 1rem;
    }
  }
`

export const AuthFormActions = styled(ButtonWrapper)`
  > ${StyledIconButton} {
    flex-shrink: 0;
  }

  ${media.down('sm')`
    gap: 0.75rem;

    > button[type='submit'] {
      padding-inline: 0.5rem;
    }
  `}
`

export const FormChangeLinks = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  max-width: 30rem;
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
    color: var(--color-primary);
  }

  a.active {
    background-color: var(--color-surface-container-high);
  }

  ${media.down('sm')`
    a {
      padding: 0.5rem 1rem;
      font-size: 1.25rem;
    }
  `}
`
