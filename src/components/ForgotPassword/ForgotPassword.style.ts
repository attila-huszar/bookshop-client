import { styled } from 'styled-components'
import { DialogBody, StyledDialog } from '@/styles/dialog.styles'

export const StyledForgotPassword = styled(StyledDialog)`
  max-height: 90dvh;
  padding: 0;
  overflow: hidden;

  &[open] {
    display: flex;
    flex-direction: column;
  }

  ${DialogBody} > form {
    width: 100%;
  }

  ${DialogBody} > p {
    margin-bottom: 1rem;
  }
`
