import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledLayout = styled.div`
  position: relative;
  min-height: 100vh;
  min-width: var(--min-width);
  max-width: var(--max-width);
  margin: 0 auto;
  border-bottom-left-radius: var(--corner-cut);
  border-bottom-right-radius: var(--corner-cut);
  background-color: var(--white);

  ${media.down('sm')`
    min-width: 100%;
    max-width: 100%;
    margin: 0;
  `}
`
