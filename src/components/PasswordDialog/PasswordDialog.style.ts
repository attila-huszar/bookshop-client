import { styled } from 'styled-components'
import { DialogBody, StyledDialog } from '@/styles/dialog.styles'

export const StyledPasswordDialog = styled(StyledDialog)`
  max-height: 90dvh;
  padding: 0;
  overflow: hidden;

  &[open] {
    display: flex;
    flex-direction: column;
  }

  ${DialogBody} > form {
    width: 100%;

    > div {
      margin-bottom: 1rem;
    }
  }
`
