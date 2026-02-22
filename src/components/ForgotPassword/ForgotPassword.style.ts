import { styled } from 'styled-components'
import { StyledDialog } from '@/styles'

export const StyledForgotPassword = styled(StyledDialog)`
  h2 {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  > form {
    width: 100%;
  }

  > :nth-child(2) {
    margin-bottom: 1rem;
  }
`
