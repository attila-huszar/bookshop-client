import { styled } from 'styled-components'
import { media } from '@/styles/media.breakpoints'

export const StyledRecommended = styled.section`
  width: 100%;
  max-width: var(--max-width);
  padding: 2.5rem 6.25rem;

  .swiper-slide {
    width: fit-content;
    max-width: 100%;
  }

  ${media.down('md')`
    padding-inline: 1.5rem;
  `}

  ${media.down('sm')`
    .swiper-slide {
      width: 100%;
    }
  `}

  h2 {
    margin-bottom: 2rem;
  }
`
