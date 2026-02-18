import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledNewsCard = styled.div`
  display: flex;
  height: 11.25rem;
  width: 36rem;
  padding: 0 0.75rem;
  border-radius: 10px;

  ${media.down('sm')`
    flex-direction: column;
    height: auto;
    width: 100%;
    padding: 0.75rem;
    gap: 0.75rem;
  `}
`

export const Details = styled.div`
  margin-right: 2rem;
  min-width: 0;

  ${media.down('sm')`
    margin-right: 0;
  `}

  h3 {
    margin-bottom: 1rem;
  }

  div {
    width: 64px;
    margin-bottom: 1rem;
    border-bottom: 3px solid var(--primary-color);
  }

  p {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

export const ImageWrap = styled.div`
  height: 10rem;
  width: 100%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--border-radius);
  }

  ${media.down('sm')`
    height: 11rem;
  `}
`
