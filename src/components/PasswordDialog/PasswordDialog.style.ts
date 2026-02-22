import { styled } from 'styled-components'
import { StyledDialog } from '@/styles'

export const StyledPasswordDialog = styled(StyledDialog)`
  h2 {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  > form {
    width: 100%;

    > div {
      margin-bottom: 1rem;
    }
  }
`
