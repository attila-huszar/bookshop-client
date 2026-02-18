import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledRecommended = styled.section`
  width: 100%;
  max-width: var(--max-width);
  padding: 2.5rem 6.25rem;

  .swiper-slide {
    width: fit-content;
  }

  ${media.down('sm')`
    padding: 2.5rem 1.5rem;

    .swiper-slide {
      width: 100%;
    }
  `}

  h2 {
    margin-bottom: 2rem;
  }
`
