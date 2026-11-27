import { styled } from 'styled-components'
import { visuallyHidden } from '@/styles/accessibility.styles'
import {
  buttonHeight,
  buttonInteractionStyles,
  iconButtonTouchArea,
} from '@/styles/button.styles'
import { media } from '@/styles/media.breakpoints'

export const StyledProducts = styled.div`
  padding: 0 5rem 4rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;

  ${media.down('md')`
    padding-inline: 1.5rem;
  `}

  ${media.down('sm')`
    grid-template-columns: minmax(0, 1fr);
    padding: 0 1rem 2rem;
  `}
`

export const ProductsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.5rem;
  row-gap: 2rem;
`

export const FilterFloatingButton = styled.button`
  display: none;

  ${media.down('sm')`
    --icon-button-size: ${buttonHeight.md};

    ${buttonInteractionStyles}
    ${iconButtonTouchArea}
    position: fixed;
    right: 1.5rem;
    bottom: 1.5rem;
    z-index: 45;
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--icon-button-size);
    aspect-ratio: 1;
    border: 0;
    border-radius: 50%;
    background: var(--color-primary);
    color: var(--color-on-primary);
    box-shadow: var(--shadow);

    @media (hover: hover) {
      &:hover:not(:disabled) {
        background-color: var(--color-primary-hover);
      }
    }

    &:active:not(:disabled) {
      background-color: color-mix(in srgb, var(--color-primary-hover), black 6%);
    }

    > svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  `}
`

export const ResultsStatus = styled.p`
  ${visuallyHidden}
`

export const ShopHeading = styled.h1`
  ${visuallyHidden}
`
