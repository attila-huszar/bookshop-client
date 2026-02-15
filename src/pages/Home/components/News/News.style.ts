import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledNews = styled.section`
  width: 100%;
  max-width: var(--max-width);
  padding: 2.5rem 6.25rem;

  ${media.down('sm')`
    padding: 2.5rem 1rem;
  `}

  h2 {
    margin-bottom: 2rem;
  }
`
