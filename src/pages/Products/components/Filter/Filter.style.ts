import { styled } from 'styled-components'
import { StyledButton } from '@/components/Button/Button.style'
import { media } from '@/styles/media.breakpoints'

export const StyledFilter = styled.aside<{ $mobileOpen: boolean }>`
  position: sticky;
  top: 7.5rem;
  bottom: 0;
  height: fit-content;
  width: auto;
  padding: 0.375rem;
  border-radius: 10px;
  background-color: var(--color-surface-container-high);

  ${({ $mobileOpen }) => media.down('sm')`
    position: fixed;
    right: 1rem;
    bottom: 5rem;
    top: auto;
    z-index: 40;
    width: 20rem;
    max-height: 70vh;
    overflow-y: auto;
    transform: translateY(${$mobileOpen ? '0' : '1rem'});
    opacity: ${$mobileOpen ? 1 : 0};
    visibility: ${$mobileOpen ? 'visible' : 'hidden'};
    pointer-events: ${$mobileOpen ? 'auto' : 'none'};
    transition: opacity 0.2s ease, transform 0.2s ease;
    box-shadow: var(--shadow-raised);
  `}
`

export const FilterOptions = styled.div`
  width: 12rem;
  user-select: none;

  ${media.down('sm')`
    width: auto;
  `}

  & > div:not(:last-child) {
    margin-bottom: 2rem;
  }

  div > div.rc-slider {
    width: auto;
    margin: 0.375rem 0.875rem 2rem;
  }

  label {
    font-size: 0.875rem;
  }

  span {
    font-weight: 700;
    white-space: pre;
  }
`

export const GenreCheckBoxes = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 0.5rem;

  & > div {
    display: flex;
    align-items: center;
    width: 50%;
  }

  label {
    margin-right: 0.375rem;
    font-size: 0.75rem;
    hyphens: auto;
  }

  input {
    margin-right: 0.375rem;
  }

  ${media.down('sm')`
    padding-inline: 0.25rem;
  `}
`

export const DiscountRadioButtons = styled.div`
  display: flex;

  input {
    margin-right: 0.5rem;
  }

  ${media.down('sm')`
    padding-inline: 0.25rem;
  `}
`

export const InputFields = styled.div`
  display: flex;
  justify-content: space-between;
  height: 1.25rem;
  line-height: normal;

  input {
    width: 4rem;
    text-align: center;
  }

  ${media.down('sm')`
    padding-inline: 0.25rem;
  `}
`

export const Rating = styled.div`
  display: flex;
  justify-content: space-between;

  ${media.down('sm')`
    padding-inline: 0.25rem;
  `}
`

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 0.5rem;
`

export const CustomButton = styled(StyledButton)`
  min-height: 1.5rem;
  padding-block: 0.125em;
  width: ${({ $inverted }) => ($inverted ? '3rem' : '6rem')};
  font-size: 0.75rem;
  border-radius: var(--border-radius);
  border-width: 1px;
`
