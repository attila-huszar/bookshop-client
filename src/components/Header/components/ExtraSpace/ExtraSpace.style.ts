import { styled } from 'styled-components'
import { media } from '@/styles'

export const ExtraSpace = styled.div`
  position: sticky;
  top: 0;
  height: 1.5rem;
  width: 100%;
  min-width: var(--min-width);
  max-width: var(--max-width);
  background-color: var(--primary-color);
  z-index: 4;

  ${media.down('sm')`
    height: 1rem;
    min-width: 100%;
    max-width: 100%;
  `}

  &::before {
    content: '';
    position: absolute;
    bottom: -1.5rem;
    height: 1.5rem;
    width: 1.5rem;
    border-top-left-radius: 20px;
    box-shadow: -20px -20px 0 20px var(--primary-color);

    ${media.down('sm')`
      height: 1rem;
      width: 1rem;
      bottom: -1rem;
    `}
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -1.5rem;
    right: 0;
    height: 1.5rem;
    width: 1.5rem;
    border-top-right-radius: 20px;
    box-shadow: 20px -20px 0 20px var(--primary-color);

    ${media.down('sm')`
      height: 1rem;
      width: 1rem;
      bottom: -1rem;
    `}
  }
`
