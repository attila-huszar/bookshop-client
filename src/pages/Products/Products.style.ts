import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledProducts = styled.main`
  padding: 0 5rem 4rem;
  display: flex;
  justify-content: space-between;

  > section {
    width: 100%;
  }

  ${media.down('sm')`
    padding: 0 1rem 2rem;
  `}
`

export const ProductsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.5rem;
  row-gap: 2rem;
  min-width: 31.5rem;

  ${media.down('sm')`
    min-width: auto;
  `}
`

export const FilterFloatingButton = styled.button`
  display: none;

  ${media.down('sm')`
    position: fixed;
    right: 1.5rem;
    bottom: 1.5rem;
    z-index: 45;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border: 0;
    border-radius: 50%;
    background: var(--primary-color);
    color: #fff;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);

    > svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  `}
`

export const FilterBackdrop = styled.div<{ $visible: boolean }>`
  display: none;

  ${({ $visible }) => media.down('sm')`
    display: ${$visible ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    z-index: 35;
    background: rgba(0, 0, 0, 0.4);
  `}
`
