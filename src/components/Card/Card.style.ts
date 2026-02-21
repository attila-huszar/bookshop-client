import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledCard = styled.div`
  height: 17.5rem;
  width: 30rem;
  border-radius: 10px;
  transition: background-color 0.3s ease-out;

  &:hover {
    background-color: var(--secondary-hover);
  }

  a {
    display: flex;
    height: 100%;
    width: 100%;
    padding: 1rem;
  }

  ${media.down('sm')`
    width: 100%;
    height: auto;

    a {
      flex-direction: column;
      padding: 0.75rem;
    }
  `}
`

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rem 0 0 2rem;
  min-width: 0;

  ${media.down('sm')`
    padding: 1rem 0 0;
    gap: 0.75rem;
  `}
`

export const Image = styled.img`
  height: 100%;
  min-width: 11.25rem;
  border-radius: var(--border-radius);
  object-fit: cover;

  ${media.down('sm')`
    width: 100%;
    height: 12rem;
    min-width: 0;
  `}
`

export const Title = styled.p`
  font-size: 1.125rem;
`

export const Description = styled.p`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 1rem;
  color: var(--grey);
  overflow: hidden;
`
