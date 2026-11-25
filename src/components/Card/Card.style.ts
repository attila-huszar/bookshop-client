import { Link } from 'react-router'
import { styled } from 'styled-components'
import { media } from '@/styles/media.breakpoints'

export const StyledCard = styled.div`
  position: relative;
  display: flex;
  height: 17.5rem;
  width: 30rem;
  max-width: 100%;
  padding: 1rem;
  border-radius: 10px;
  background-color: var(--color-surface-container-low);
  border: 1px solid var(--color-outline-variant);
  color: var(--color-on-surface);
  transition: background-color 0.3s ease-out;

  &:hover {
    background-color: var(--color-surface-container);
  }

  ${media.down('sm')`
    width: 100%;
    height: auto;
    flex-direction: column;
    padding: 0.75rem;
  `}
`

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rem 0 0 2rem;
  min-width: 0;
  overflow-wrap: anywhere;

  > button {
    position: relative;
    z-index: 1;
  }

  ${media.down('md')`
    padding: 0 0 0 1rem;
    gap: 0.75rem;
  `}

  ${media.down('sm')`
    padding: 1rem 0 0;
  `}
`

export const Image = styled.img`
  height: 100%;
  width: min(40%, 11.25rem);
  flex-shrink: 0;
  border-radius: var(--border-radius);
  object-fit: cover;

  ${media.down('sm')`
    width: 100%;
    height: 12rem;
  `}
`

export const Title = styled(Link)`
  font-size: 1.125rem;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 10px;
  }

  &:focus-visible::after {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }
`

export const Description = styled.p`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 1rem;
  color: var(--color-on-surface-variant);
  overflow: hidden;
`
