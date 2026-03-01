import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledPasswordReset = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 6.25rem 4rem;

  ${media.down('sm')`
    padding: 0 1rem 4rem;
  `}

  h2 {
    margin-bottom: 1rem;
  }

  > p {
    margin-bottom: 2rem;
  }

  form {
    width: 100%;
    max-width: 30rem;

    > div {
      margin-bottom: 1rem;
    }
  }
`
